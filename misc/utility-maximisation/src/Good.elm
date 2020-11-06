module Good exposing
    ( Calculation
    , Good
    , GoodRaw
    , UtilityDatum(..)
    , UtilityRaw(..)
    , calculateUtilities
    , maxUtility
    , new
    , toGood
    , Step
    )

import Array exposing (Array)
import Price exposing (Price)
import Utility exposing (Utility)
import Utils exposing (isJust, justEqual, mapUntil)


type UtilityRaw
    = TotalUtilityRaw String
    | MarginalUtilityRaw String
    | MUPerDollarRaw String
    | Unset


type alias GoodRaw =
    { name : String
    , price : String
    , utilities : Array UtilityRaw
    }


new : GoodRaw
new =
    { name = "", price = "", utilities = Array.repeat 1 Unset }


type UtilityDatum
    = TotalUtility Utility
    | MarginalUtility Utility
    | MUPerDollar Utility
    | Unknown


toUtility : UtilityRaw -> Maybe UtilityDatum
toUtility raw =
    case raw of
        TotalUtilityRaw utility ->
            utility |> Utility.fromString |> Maybe.map TotalUtility

        MarginalUtilityRaw utility ->
            utility |> Utility.fromString |> Maybe.map MarginalUtility

        MUPerDollarRaw utility ->
            utility |> Utility.fromString |> Maybe.map MUPerDollar

        Unset ->
            Just Unknown


type alias Calculation =
    { total : Utility
    , marginal : Utility
    , perDollar : Utility
    }


type alias CalculateDatumModel =
    ( Maybe Utility, List Calculation )


calculateDatum : Price -> UtilityDatum -> CalculateDatumModel -> CalculateDatumModel
calculateDatum price datum ( maybeLastUtility, muPerPrices ) =
    case ( maybeLastUtility, datum ) of
        ( Just lastUtility, TotalUtility total ) ->
            ( Just total
            , { total = total
              , marginal = total - lastUtility
              , perDollar = (total - lastUtility) / price
              }
                :: muPerPrices
            )

        ( Just lastUtility, MarginalUtility marginal ) ->
            ( Just (lastUtility + marginal)
            , { total = lastUtility + marginal
              , marginal = marginal
              , perDollar = marginal / price
              }
                :: muPerPrices
            )

        ( Just lastUtility, MUPerDollar perDollar ) ->
            ( Just (lastUtility + perDollar * price)
            , { total = lastUtility + perDollar * price
              , marginal = perDollar * price
              , perDollar = perDollar
              }
                :: muPerPrices
            )

        _ ->
            ( Nothing, muPerPrices )


calculateUtilities : Good -> List Calculation
calculateUtilities good =
    good.utilities
        |> Array.toList
        |> List.foldl (calculateDatum good.price) ( Just 0, [] )
        |> Tuple.second
        |> List.reverse


type alias Good =
    { name : String
    , price : Price
    , utilities : Array UtilityDatum
    }


toGood : GoodRaw -> Maybe Good
toGood raw =
    Price.fromString raw.price
        |> Maybe.map
            (\price ->
                { name = raw.name
                , price = price
                , utilities =
                    Array.map toUtility raw.utilities
                        |> Array.toList
                        |> mapUntil identity
                        |> Array.fromList
                }
            )


type alias ResolvedGood =
    { name : String
    , price : Price
    , muPerDollars : Array Price
    }


resolveGood : Good -> ResolvedGood
resolveGood good =
    { name = good.name
    , price = good.price
    , muPerDollars = good |> calculateUtilities |> List.map .perDollar |> Array.fromList
    }

type alias Step =
    { muPerDollars : List (String, Int, Maybe Utility)
    , bought : List String
    , incomeAfter : Price
    }

type alias MaxUtilityModel =
    ( List Step, (Price, List Int) )


getMUPP : Price -> ( Int, ResolvedGood ) -> ( ( Int, Price ), Maybe Utility )
getMUPP income ( count, { price, muPerDollars } ) =
    ( ( count, price )
    , if income < price then
        Nothing

      else
        Array.get count muPerDollars
    )

maxUtilityStep : List ResolvedGood -> MaxUtilityModel -> (List Int, List Step)
maxUtilityStep goods ( steps, (income, purchased) ) =
    let
        -- ((quantity bought, item price), MU per dollar)[]
        withMUPP : List ( ( Int, Price ), Maybe Utility )
        withMUPP =
            List.map2 Tuple.pair purchased goods
                |> List.map (getMUPP income)

        maxMUPP : Maybe Utility
        maxMUPP =
            withMUPP
                |> List.filterMap Tuple.second
                |> List.maximum

        spent : Price
        spent =
            withMUPP
                |> List.filter (\( _, mupp ) -> justEqual mupp maxMUPP)
                |> List.map (Tuple.first >> Tuple.second)
                |> List.foldl (+) 0

        step : Step
        step =
            { muPerDollars = List.map2 Tuple.pair withMUPP goods
                |> List.map (\(((quantity, _), mupp), { name }) -> (name, quantity, mupp))
            , bought = List.map2 Tuple.pair withMUPP goods
                |> List.filterMap (\(( _, mupp ), { name }) -> if justEqual mupp maxMUPP then
                    Just name
                else
                    Nothing)
            , incomeAfter = income - spent
            }
    in
    case ( maxMUPP, spent <= income ) of
        ( Just max, True ) ->
            withMUPP
                |> List.map
                    (\( ( count, _ ), mupp ) ->
                        if justEqual mupp maxMUPP then
                            count + 1

                        else
                            count
                    )
                |> Tuple.pair (income - spent)
                |> Tuple.pair (step :: steps)
                |> maxUtilityStep goods

        _ ->
            (purchased, steps)


maxUtility : List Good -> Price -> (List Int, List Step)
maxUtility goodData income =
    let
        goods =
            List.map resolveGood goodData
    in
    maxUtilityStep goods ( [], (income, List.repeat (List.length goods) 0) )
