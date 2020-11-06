module Main exposing (main)

import Array exposing (Array)
import Browser
import Good exposing (Good, GoodRaw, UtilityRaw(..))
import Html exposing (Html, text)
import Html.Attributes as A
import Html.Events as E
import Price exposing (Price)
import Utility exposing (Utility)
import Utils exposing (removeFromArray, removeFromList, noAttribute)


main =
    Browser.sandbox { init = init, update = update, view = view }


type alias Model =
    { goods : Array GoodRaw
    , income : String
    }


init : Model
init =
    { goods = Array.empty
    , income = ""
    }


type alias Msg = Model -> Model


updateGood : (GoodRaw -> GoodRaw) -> Int -> Model -> Model
updateGood updateFn index model =
    { model
        | goods =
            case Array.get index model.goods of
                Just good ->
                    Array.set index (updateFn good) model.goods

                Nothing ->
                    model.goods
    }


update : Msg -> Model -> Model
update msg model = msg model

newGood : Model -> Model
newGood model =
    { model | goods = Array.push Good.new model.goods }

updateUtility : Int -> Int -> (String -> UtilityRaw) -> String -> Model -> Model
updateUtility goodIndex utilityIndex utilityField utility model =
    updateGood
        (\good ->
            { good
            | utilities =
                Array.set
                    utilityIndex
                    (if utility == "" then
                        Unset
                    else
                        utilityField utility)
                    good.utilities
            }
        )
        goodIndex
        model


th : List (Html Msg) -> Html Msg
th =
    Html.td
        [ A.style "border" "1px solid black"
        ]


td : List (Html Msg) -> Html Msg
td =
    Html.td
        [ A.style "border" "1px solid black"
        ]


row : List (Html Msg) -> Html Msg
row elements =
    Html.tr []
        [ Html.td
            [ A.style "border" "1px solid black"
            , A.colspan 5
            ]
            elements
        ]

floatInput : String -> String -> (String -> Msg) -> Html Msg
floatInput placeholder value msg =
    Html.input
        [ A.type_ "number"
        , A.placeholder placeholder
        , E.onInput msg
        , case String.toFloat value of
            Just _ ->
                A.style "background-color" "rgba(0, 127, 255, 0.1)"
            Nothing ->
                A.style "background-color" "rgba(255, 0, 0, 0.2)"
        , A.value value
        ]
        []


utilityInput : String -> (String -> Msg) -> Html Msg
utilityInput = floatInput "Utility"

utilityEditor : Array Good.Calculation -> Int -> Array Good.UtilityRaw -> Int -> Good.UtilityRaw -> Html Msg
utilityEditor computedUtilities goodIndex utilities utilityIndex utility =
    let
        updater = updateUtility goodIndex utilityIndex
        computed = Array.get utilityIndex computedUtilities
    in
    Html.tr []
        (((utilityIndex + 1) |> String.fromInt |> text)
            :: (case utility of
                    TotalUtilityRaw utils ->
                        [ updater TotalUtilityRaw |> utilityInput utils
                        , computed |> Maybe.map .marginal |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        , computed |> Maybe.map .perDollar |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        ]

                    MarginalUtilityRaw utils ->
                        [ computed |> Maybe.map .total |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        , updater MarginalUtilityRaw |> utilityInput utils
                        , computed |> Maybe.map .perDollar |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        ]

                    MUPerDollarRaw utils ->
                        [ computed |> Maybe.map .total |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        , computed |> Maybe.map .marginal |> Maybe.map Utility.toString |> Maybe.withDefault "?" |> text
                        , updater MUPerDollarRaw |> utilityInput utils
                        ]

                    Unset ->
                        [ TotalUtilityRaw, MarginalUtilityRaw, MUPerDollarRaw ]
                            |> List.map updater
                            |> List.map (utilityInput "")
               )++ [Html.button [ E.onClick (\model -> updateGood
               (\good2 ->
                   { good2
                   | utilities = removeFromArray utilityIndex good2.utilities
                   }
               )
               goodIndex
               model) ] [ text "x" ]]
            |> List.map List.singleton
            |> List.map td
        )


goodEditor : Int -> GoodRaw -> Html Msg
goodEditor goodIndex good =
    let
        utilities = Good.toGood good
            |> Maybe.map Good.calculateUtilities
            |> Maybe.withDefault []
            |> Array.fromList
    in
    Html.table
        [ A.style "border-collapse" "collapse"
        , A.style "margin" "20px 0"
        ]
        ([ row
            [ Html.input
                [ E.onInput (\name model ->
                    updateGood (\good2 -> { good2 | name = name }) goodIndex model)
                , A.placeholder "Good name"
                , A.value good.name
                ]
                []
            ]
         , row
            [ text "Price: $"
            , floatInput "Price" good.price (\price model ->
                updateGood (\good2 -> { good2 | price = price }) goodIndex model)
            ]
        , row [ Html.button [ E.onClick (\model -> updateGood
            (\good2 ->
                { good2
                | utilities = Array.push Unset good2.utilities
                }
            )
            goodIndex
            model) ] [ text "+ Add row" ] ]
         , Html.tr []
            [ "Quantity" |> text |> List.singleton |> td
            , "Total utility" |> text |> List.singleton |> td
            , "Marginal utility" |> text |> List.singleton |> td
            , "Marginal utility over price" |> text |> List.singleton |> td
            , "Remove" |> text |> List.singleton |> td
            ]
         ]
            ++ (Array.indexedMap (utilityEditor utilities goodIndex good.utilities) good.utilities |> Array.toList)
        )

renderMaxUtilityResult : (Good, Int) -> Html Msg
renderMaxUtilityResult ({ name }, count) =
    [ name
    , String.fromInt count
    ]
        |> List.map text
        |> List.map List.singleton
        |> List.map td
        |> Html.tr []

renderMaxUtility : Model -> Html Msg
renderMaxUtility model =
    case (Price.fromString model.income, model.goods |> Array.toList |> List.filterMap Good.toGood) of
        (Nothing, _) ->
            text "Invalid income"
                |> List.singleton
                |> Html.p []
        (_, []) ->
            text "No valid goods (add a new good or look for red outlines)"
                |> List.singleton
                |> Html.p []

        (Just income, goods) ->
            Good.maxUtility goods income
                |> List.map2 Tuple.pair goods
                |> List.map renderMaxUtilityResult
                |> Html.table
                    [ A.style "border-collapse" "collapse"
                    ]


view : Model -> Html Msg
view model =
    Html.div []
        (Html.p [] [
        Html.label [] [
        text "Income: ",
        floatInput "Income" model.income (\income model2 -> { model2 | income = income })
        ] |> List.singleton |> Html.p []
        ]
        :: Html.button [ E.onClick newGood ] [ text "New good" ]
            :: (Array.indexedMap goodEditor model.goods |> Array.toList)
            ++ [renderMaxUtility model]
        )
