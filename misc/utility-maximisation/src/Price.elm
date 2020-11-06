module Price exposing (Price, toString, fromString)



type alias Price = Float

toString : Price -> String
toString = String.fromFloat

fromString : String -> Maybe Price
fromString = String.toFloat
