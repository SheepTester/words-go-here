module Utility exposing (Utility, fromString, toString)


type alias Utility =
    Float


toString : Utility -> String
toString =
    String.fromFloat


fromString : String -> Maybe Utility
fromString =
    String.toFloat
