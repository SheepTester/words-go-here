module Price exposing (Price, fromString, toString)


type alias Price =
    Float


toString : Price -> String
toString =
    String.fromFloat


fromString : String -> Maybe Price
fromString =
    String.toFloat
