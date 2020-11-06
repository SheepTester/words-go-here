module Utils exposing (justEqual, removeFromArray, removeFromList, isJust, noAttribute)

import Array exposing (Array)
import Html
import Html.Attributes


-- https://stackoverflow.com/a/33101419


removeFromList : Int -> List a -> List a
removeFromList index list =
    List.take index list ++ List.drop (index + 1) list


removeFromArray : Int -> Array a -> Array a
removeFromArray index =
    Array.toList >> removeFromList index >> Array.fromList


justEqual : Maybe a -> Maybe a -> Bool
justEqual maybeA maybeB =
    case ( maybeA, maybeB ) of
        ( Just a, Just b ) ->
            a == b

        _ ->
            False

isJust : Maybe a -> Bool
isJust maybe =
    case maybe of
        Just _ ->
            True

        Nothing ->
            False

noAttribute : Html.Attribute msg
noAttribute =
    Html.Attributes.classList []
