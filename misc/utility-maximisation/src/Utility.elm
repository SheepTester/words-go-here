module Utility exposing
    (Utility
    , fromString
    , toString
    , fromPerDollar
    , toPerDollar
    )

import Price exposing (Price)


type alias Utility =
    Float


toString : Utility -> String
toString =
    String.fromFloat


fromString : String -> Maybe Utility
fromString =
    String.toFloat

fromPerDollar : Price -> Utility -> Utility
fromPerDollar price perDollar =
    perDollar * price

toPerDollar : Price -> Utility -> Utility
toPerDollar price utility =
    utility / price
