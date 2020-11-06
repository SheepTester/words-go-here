module Utils exposing (removeFromList, removeFromArray, justEqual)
import Array exposing (Array)

-- https://stackoverflow.com/a/33101419
removeFromList : Int -> List a -> List a
removeFromList index list =
  List.take index list ++ List.drop (index + 1) list

removeFromArray : Int -> Array a -> Array a
removeFromArray index =
  Array.toList >> removeFromList index >> Array.fromList

justEqual : Maybe a -> Maybe a -> Bool
justEqual maybeA maybeB =
    case (maybeA, maybeB) of
        (Just a, Just b) ->
            a == b

        _ ->
            False
