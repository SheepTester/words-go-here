module Good exposing (Calculation, Good, UtilityDatum(..))

import Array exposing (Array)
import Price exposing (Price)
import Utility exposing (Utility)
import Utils exposing (justEqual)


type UtilityDatum
    = TotalUtility Utility
    | MarginalUtility Utility
    | MUPerDollar Utility
    | Unknown


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


type alias ResolvedGood =
    { price : Price
    , muPerDollars : Array Price
    }


resolveGood : Good -> ResolvedGood
resolveGood good =
    { price = good.price
    , muPerDollars = good |> calculateUtilities |> List.map .perDollar |> Array.fromList
    }


type alias MaxUtilityModel =
    ( Price, List Int )


getMUPP : Price -> ( Int, ResolvedGood ) -> ( ( Int, Price ), Maybe Utility )
getMUPP income ( count, { price, muPerDollars } ) =
    ( ( count, price )
    , if income < price then
        Nothing

      else
        Array.get count muPerDollars
    )


maxUtilityStep : List ResolvedGood -> MaxUtilityModel -> List Int
maxUtilityStep goods ( income, purchased ) =
    let
        withMUPP =
            List.map2 Tuple.pair purchased goods
                |> List.map (getMUPP income)

        maxMUPP =
            withMUPP
                |> List.filterMap Tuple.second
                |> List.maximum

        spent =
            withMUPP
                |> List.filter (\( _, mupp ) -> justEqual mupp maxMUPP)
                |> List.map (Tuple.first >> Tuple.second)
                |> List.foldl (+) 0
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
                |> maxUtilityStep goods

        _ ->
            purchased


maxUtility : Array Good -> Price -> List Int
maxUtility goodData income =
    let
        goods =
            goodData |> Array.toList |> List.map resolveGood
    in
    maxUtilityStep goods ( income, List.repeat (List.length goods) 0 )
