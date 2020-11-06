module Main exposing (main)

import Browser
import Html exposing (Html, text)
import Html.Attributes as A
import Html.Events as E
import Array exposing (Array)
import Price exposing (Price)
import Utility exposing (Utility)
import Utils exposing (removeFromList, removeFromArray)
import Good exposing (Good, UtilityDatum(..))

main =
    Browser.sandbox { init = init, update = update, view = view }

type alias Model =
    { goods : Array Good
    }


init : Model
init =
    { goods = Array.empty
    }


type Msg
    = New
    | ChangeName Int String
    | ChangePrice Int String
    | Remove Int
    | SetTU Int Int String
    | SetMU Int Int String
    | SetMUPP Int Int String


updateName : Int -> String -> Int -> Good -> Good
updateName index name i good =
    if index == i then
        { good | name = name }

    else
        good


updatePrice : Int -> Price -> Int -> Good -> Good
updatePrice index price i good =
    if index == i then
        { good | price = price }

    else
        good


update : Msg -> Model -> Model
update msg model =
    case msg of
        New ->
            { model | goods = Array.push { name = "", price = 0, utilities = Array.repeat 1 Unknown } model.goods }

        ChangeName index name ->
            { model
            | goods = case Array.get index model.goods of
                Just good ->
                    Array.set index { good | name = name } model.goods
                Nothing -> model.goods
            }

        ChangePrice index priceString ->
            { model
            | goods = case (Array.get index model.goods, Price.fromString priceString) of
                (Just good, Just price) ->
                    Array.set index { good | price = price } model.goods
                _ -> model.goods
            }

        Remove index ->
            { model
            | goods = removeFromArray index model.goods
            }

        SetTU goodIndex utilityIndex utilString ->
            { model
            | goods = case (Array.get goodIndex model.goods, Utility.fromString utilString |> Maybe.map TotalUtility) of
                (Just good, Just utility) ->
                    Array.set goodIndex { good | utilities = Array.set utilityIndex utility good.utilities } model.goods
                _ -> model.goods
            }

        SetMU goodIndex utilityIndex utilString ->
            { model
            | goods = case (Array.get goodIndex model.goods, Utility.fromString utilString |> Maybe.map MarginalUtility) of
                (Just good, Just utility) ->
                    Array.set goodIndex { good | utilities = Array.set utilityIndex utility good.utilities } model.goods
                _ -> model.goods
            }

        SetMUPP goodIndex utilityIndex utilString ->
            { model
            | goods = case (Array.get goodIndex model.goods, Utility.fromString utilString |> Maybe.map MUPerDollar) of
                (Just good, Just utility) ->
                    Array.set goodIndex { good | utilities = Array.set utilityIndex utility good.utilities } model.goods
                _ -> model.goods
            }

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
            ] elements
        ]

utilityInput : Price -> (String -> Msg) -> Html Msg
utilityInput utils msg =
    Html.input [
    A.type_ "number"
    -- , utils |> fromPrice |> A.value
    , E.onInput msg
    ] []

utilityEditor : Int -> (Array Good.UtilityDatum) -> Int -> Good.UtilityDatum -> Html Msg
utilityEditor goodIndex utilities utilityIndex utility =
    Html.tr []
        (((utilityIndex + 1) |> String.fromInt |> text |> List.singleton |> td) :: (case utility of
            TotalUtility utils ->
                [ SetTU goodIndex utilityIndex |> utilityInput utils
                , "3" |> text
                , "3" |> text
                ]

            MarginalUtility utils ->
                [ "3" |> text
                , SetMU goodIndex utilityIndex |> utilityInput utils
                , "3" |> text
                ]

            MUPerDollar utils ->
                [ "3" |> text
                , "3" |> text
                , SetMUPP goodIndex utilityIndex |> utilityInput utils
                ]

            Unknown -> [SetTU, SetMU, SetMUPP] |> List.map (\msg -> msg goodIndex utilityIndex) |> List.map (utilityInput 0)
                ) |> List.map List.singleton |> List.map td)

goodEditor : Int -> Good -> Html Msg
goodEditor goodIndex good =
    Html.table
        [ A.style "border-collapse" "collapse"
        ]
        ([ row [ Html.input
                [ ChangeName goodIndex |> E.onInput
                , A.placeholder "Good name"
                , A.value good.name
                ]
                []
            ]
        , row [ text "Price: $", Html.input
                [ ChangePrice goodIndex |> E.onInput
                , A.type_ "number"
                , A.placeholder "Price"
                , Price.toString good.price |> A.value
                ]
                []
            ]
        , Html.tr []
            [ "Quantity" |> text |> List.singleton |> td
            , "Total utility" |> text |> List.singleton |> td
            , "Marginal utility" |> text |> List.singleton |> td
            , "Marginal utility over price" |> text |> List.singleton |> td
            ]
        ] ++ (Array.indexedMap (utilityEditor goodIndex good.utilities) good.utilities |> Array.toList))


view : Model -> Html Msg
view model =
    Html.div []
        (Html.button [ E.onClick New ] [ text "New good" ]
            :: (Array.indexedMap goodEditor model.goods |> Array.toList)
        )
