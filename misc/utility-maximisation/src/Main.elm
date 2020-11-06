module Main exposing (main)

import Array exposing (Array)
import Browser
import Good exposing (GoodRaw, UtilityRaw(..))
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


type Msg
    = New
    | ChangeName Int String
    | ChangePrice Int String
    | Remove Int
    | SetTU Int Int String
    | SetMU Int Int String
    | SetMUPP Int Int String


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
update msg model =
    case msg of
        New ->
            { model | goods = Array.push Good.new model.goods }

        ChangeName index name ->
            updateGood (\good -> { good | name = name }) index model

        ChangePrice index price ->
            updateGood (\good -> { good | price = price }) index model

        Remove index ->
            { model
                | goods = removeFromArray index model.goods
            }

        SetTU goodIndex utilityIndex utility ->
            updateGood (\good -> { good | utilities = Array.set utilityIndex (TotalUtilityRaw utility) good.utilities }) goodIndex model

        SetMU goodIndex utilityIndex utility ->
            updateGood (\good -> { good | utilities = Array.set utilityIndex (MarginalUtilityRaw utility) good.utilities }) goodIndex model

        SetMUPP goodIndex utilityIndex utility ->
            updateGood (\good -> { good | utilities = Array.set utilityIndex (MUPerDollarRaw utility) good.utilities }) goodIndex model


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
            , A.colspan 4
            ]
            elements
        ]

floatInput : String -> (String -> Msg) -> Html Msg
floatInput value msg =
    Html.input
        [ A.type_ "number"
        , E.onInput msg
        , case String.toFloat value of
            Just _ ->
                noAttribute
            Nothing ->
                A.style "box-shadow" "0 0 3px red"
        , A.value value
        ]
        []


utilityEditor : Int -> Array Good.UtilityRaw -> Int -> Good.UtilityRaw -> Html Msg
utilityEditor goodIndex utilities utilityIndex utility =
    Html.tr []
        (((utilityIndex + 1) |> String.fromInt |> text |> List.singleton |> td)
            :: (case utility of
                    TotalUtilityRaw utils ->
                        [ SetTU goodIndex utilityIndex |> floatInput utils
                        , "3" |> text
                        , "3" |> text
                        ]

                    MarginalUtilityRaw utils ->
                        [ "3" |> text
                        , SetMU goodIndex utilityIndex |> floatInput utils
                        , "3" |> text
                        ]

                    MUPerDollarRaw utils ->
                        [ "3" |> text
                        , "3" |> text
                        , SetMUPP goodIndex utilityIndex |> floatInput utils
                        ]

                    Unset ->
                        [ SetTU, SetMU, SetMUPP ] |> List.map (\msg -> msg goodIndex utilityIndex) |> List.map (floatInput "")
               )
            |> List.map List.singleton
            |> List.map td
        )


goodEditor : Int -> GoodRaw -> Html Msg
goodEditor goodIndex good =
    Html.table
        [ A.style "border-collapse" "collapse"
        ]
        ([ row
            [ Html.input
                [ ChangeName goodIndex |> E.onInput
                , A.placeholder "Good name"
                , A.value good.name
                ]
                []
            ]
         , row
            [ text "Price: $"
            , Html.input
                [ ChangePrice goodIndex |> E.onInput
                , A.type_ "number"
                , A.placeholder "Price"
                , A.value good.price
                ]
                []
            ]
         , Html.tr []
            [ "Quantity" |> text |> List.singleton |> td
            , "Total utility" |> text |> List.singleton |> td
            , "Marginal utility" |> text |> List.singleton |> td
            , "Marginal utility over price" |> text |> List.singleton |> td
            ]
         ]
            ++ (Array.indexedMap (utilityEditor goodIndex good.utilities) good.utilities |> Array.toList)
        )

renderMaxUtility : Model -> Html Msg
renderMaxUtility model =
    case Price.fromString model.income of
        Just income ->
            text "cool"

        Nothing ->
            text "Invalid income"


view : Model -> Html Msg
view model =
    Html.div []
        (Html.button [ E.onClick New ] [ text "New good" ]
            :: (Array.indexedMap goodEditor model.goods |> Array.toList)
            ++ [renderMaxUtility model]
        )
