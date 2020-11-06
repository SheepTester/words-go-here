module Price exposing (Price, fromString, toString)

import Round


type alias Price =
    Float


toString : Price -> String
toString =
    Round.round 2 >> String.append "$"


fromString : String -> Maybe Price
fromString =
    String.toFloat
