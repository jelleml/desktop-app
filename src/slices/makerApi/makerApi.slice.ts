import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getKaleidoClient } from '../../api/client';
import { RootState } from '../../app/store';
import {
  ChannelFees,
  ConfirmSwapRequest,
  PairResponse,
  PairQuoteResponse,
  PairQuoteRequest,
  GetInfoResponseModel,
  OrderResponse,
  CreateOrderRequest,
  GetOrderRequest,
  SwapResponse,
  SwapRequest,
  RetryDeliveryResponse,
  RetryDeliveryRequest,
  SwapStatusResponse,
  SwapStatusRequest,
} from 'kaleidoswap-sdk';

// Aliases for compatibility
export type TradingPair = any; // Placeholder for Pair inside PairResponse?
export type Lsps1CreateOrderRequest = CreateOrderRequest;
export type Lsps1CreateOrderResponse = OrderResponse;
export type QuoteRequest = PairQuoteRequest;
export type QuoteResponse = PairQuoteResponse;
export type Lsps1GetInfoResponse = GetInfoResponseModel;
export type Lsps1GetOrderResponse = OrderResponse;
export type Lsps1GetOrderRequest = GetOrderRequest;
export type InitSwapResponse = SwapResponse;
export type InitSwapRequest = SwapRequest;
export type ExecSwapRequest = ConfirmSwapRequest;
export type StatusResponse = SwapStatusResponse;
export type StatusRequest = SwapStatusRequest;
export type GetPairsResponse = PairResponse;

export const makerApi = createApi({
  reducerPath: 'makerApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    create_order: builder.query<Lsps1CreateOrderResponse, Lsps1CreateOrderRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.lsps1.createOrderApiV1Lsps1CreateOrderPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    estimate_fees: builder.query<ChannelFees, Lsps1CreateOrderRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.lsps1.estimateFeesApiV1Lsps1EstimateFeesPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    execSwap: builder.query<void, ExecSwapRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.maker.swaps.confirmSwapApiV1SwapsExecutePost(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    getPairs: builder.query<GetPairsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.market.getPairsApiV1MarketPairsGet();
          return { data: res as any };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    getQuote: builder.query<QuoteResponse, QuoteRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.market.getQuoteApiV1MarketQuotePost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    get_info: builder.query<Lsps1GetInfoResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.lsps1.getInfoApiV1Lsps1GetInfoGet();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    get_order: builder.query<Lsps1GetOrderResponse, Lsps1GetOrderRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.lsps1.getOrderApiV1Lsps1GetOrderPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    initSwap: builder.query<InitSwapResponse, InitSwapRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.swaps.initiateSwapApiV1SwapsInitPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    retry_delivery: builder.query<RetryDeliveryResponse, RetryDeliveryRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.lsps1.retryDeliveryApiV1Lsps1RetryDeliveryPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    status: builder.query<StatusResponse, StatusRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.maker.swaps.getSwapStatusApiV1SwapsAtomicStatusPost(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
  }),
});
