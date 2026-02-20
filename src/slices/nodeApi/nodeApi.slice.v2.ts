/**
 * Node API Slice (v2)
 * 
 * Improved version using NodeApiWrapper for cleaner code and better error handling
 */

import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getNodeApiWrapper, MinimalState } from '../../api/client';
import type {
  AddressResponse,
  AssetBalanceResponse,
  AssetBalanceRequest,
  BackupRequest,
  BtcBalanceResponse,
  CloseChannelRequest,
  ConnectPeerRequest,
  CreateUtxosRequest,
  DecodeLNInvoiceResponse,
  DecodeLNInvoiceRequest,
  DecodeRgbInvoiceResponse as DecodeRGBInvoiceResponse,
  DecodeRgbInvoiceRequest as DecodeRGBInvoiceRequest,
  DisconnectPeerRequest,
  EstimateFeeResponse,
  EstimateFeeRequest,
  InitRequest,
  GetInvoiceStatusResponse as InvoiceStatusResponse,
  GetInvoiceStatusRequest as InvoiceStatusRequest,
  IssueAssetNIAResponse,
  IssueAssetNIARequest,
  ListAssetsResponse,
  ListChannelsResponse,
  ListPaymentsResponse,
  ListTransactionsResponse,
  ListTransfersResponse,
  ListUnspentsResponse,
  CreateLNInvoiceResponse as LNInvoiceResponse,
  CreateLNInvoiceRequest as LNInvoiceRequest,
  NodeInfoResponse,
  OpenChannelResponse,
  OpenChannelRequest,
  RefreshTransfersRequest as RefreshRequest,
  RestoreRequest,
  CreateRgbInvoiceResponse as RgbInvoiceResponse,
  CreateRgbInvoiceRequest as RgbInvoiceRequest,
  SendRgbResponse,
  SendRgbRequest,
  SendBtcRequest,
  SendPaymentResponse,
  SendPaymentRequest,
  SignMessageResponse,
  SignMessageRequest,
  UnlockRequest,
  KeysendResponse,
  KeysendRequest,
  ListPeersResponse,
  ListSwapsResponse,
  WhitelistTradeRequest,
  NetworkInfoResponse,
} from 'kaleidoswap-sdk';

export type {
  Assignment,
  AssignmentFungible,
  Asset,
  Channel,
  MakerExecuteRequest,
  MakerInitRequest,
  MakerInitResponse,
  NiaAsset,
  TakerRequest,
} from './types';

export const Network = {
  Mainnet: 'mainnet',
  Testnet: 'testnet',
  Regtest: 'regtest',
  Signet: 'signet',
} as const;
export type Network = typeof Network[keyof typeof Network];

import {
  MakerInitRequest,
  MakerInitResponse,
  MakerExecuteRequest,
  TakerRequest,
} from './types';

// Re-export types for backwards compatibility
export type { SendPaymentResponse };

export interface NodeApiError {
  status: number;
  data: {
    error: string;
  };
}

/**
 * Create a query function that uses the NodeApiWrapper
 * Properly transforms ApiResult to RTK Query format
 */
function createQueryFn<TArgs, TResult>(
  apiCall: (wrapper: Awaited<ReturnType<typeof getNodeApiWrapper>>, args: TArgs) => Promise<any>
) {
  return async (args: TArgs, api: { getState: () => unknown }) => {
    try {
      const wrapper = await getNodeApiWrapper(api.getState() as MinimalState);
      const result = await apiCall(wrapper, args);

      // Transform ApiResult to RTK Query format
      if (result && 'error' in result && result.error) {
        return { error: result.error };
      }

      // Ensure we return data even if it's undefined
      return { data: result?.data as TResult };
    } catch (error) {
      return {
        error: {
          status: 'CUSTOM_ERROR' as const,
          error: String(error),
          data: undefined
        }
      };
    }
  };
}

/**
 * Create a query function for void arguments
 */
function createQueryFnVoid<TResult>(
  apiCall: (wrapper: Awaited<ReturnType<typeof getNodeApiWrapper>>) => Promise<any>
) {
  return async (_args: void, api: { getState: () => unknown }) => {
    try {
      const wrapper = await getNodeApiWrapper(api.getState() as MinimalState);
      const result = await apiCall(wrapper);

      // Transform ApiResult to RTK Query format
      if (result && 'error' in result && result.error) {
        return { error: result.error };
      }

      // Ensure we return data even if it's undefined
      return { data: result?.data as TResult };
    } catch (error) {
      return {
        error: {
          status: 'CUSTOM_ERROR' as const,
          error: String(error),
          data: undefined
        }
      };
    }
  };
}

export const nodeApi = createApi({
  reducerPath: 'nodeApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    // ============================================================================
    // Wallet Management
    // ============================================================================

    nodeInfo: builder.query<NodeInfoResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.getNodeInfo()),
    }),

    networkInfo: builder.query<NetworkInfoResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.getNetworkInfo()),
    }),

    init: builder.query<void, InitRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.initWallet(args)),
    }),

    unlock: builder.query<void, UnlockRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.unlockWallet(args)),
    }),

    lock: builder.query<void, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.lockWallet()),
    }),

    backup: builder.mutation<void, BackupRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.backup(args)),
    }),

    restore: builder.mutation<void, RestoreRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.restore(args)),
    }),

    shutdown: builder.query<void, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.shutdown()),
    }),

    // ============================================================================
    // BTC Operations
    // ============================================================================

    address: builder.query<AddressResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.getAddress()),
    }),

    btcBalance: builder.query<BtcBalanceResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.getBtcBalance()),
    }),

    sendBtc: builder.mutation<void, SendBtcRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.sendBtc(args)),
    }),

    listTransactions: builder.query<ListTransactionsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listTransactions()),
    }),

    listUnspents: builder.query<ListUnspentsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listUnspents()),
    }),

    createUtxos: builder.mutation<void, CreateUtxosRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.createUtxos(args)),
    }),

    estimateFee: builder.query<EstimateFeeResponse, EstimateFeeRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.estimateFee(args)),
    }),

    // ============================================================================
    // RGB Asset Operations
    // ============================================================================

    listAssets: builder.query<ListAssetsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listAssets()),
    }),

    assetBalance: builder.query<AssetBalanceResponse, AssetBalanceRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.getAssetBalance(args)),
    }),

    issueNiaAsset: builder.mutation<IssueAssetNIAResponse, IssueAssetNIARequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.issueAssetNIA(args)),
    }),

    sendRgb: builder.mutation<SendRgbResponse, SendRgbRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.sendRgb(args)),
    }),

    listTransfers: builder.query<ListTransfersResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listTransfers()),
    }),

    refresh: builder.mutation<void, RefreshRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.refreshTransfers(args)),
    }),

    // ============================================================================
    // Lightning Network - Channels
    // ============================================================================

    listChannels: builder.query<ListChannelsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listChannels()),
    }),

    openChannel: builder.mutation<OpenChannelResponse, OpenChannelRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.openChannel(args)),
    }),

    closeChannel: builder.mutation<void, CloseChannelRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.closeChannel(args)),
    }),

    // ============================================================================
    // Lightning Network - Peers
    // ============================================================================

    listPeers: builder.query<ListPeersResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listPeers()),
    }),

    connectPeer: builder.mutation<void, ConnectPeerRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.connectPeer(args)),
    }),

    disconnectPeer: builder.mutation<void, DisconnectPeerRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.disconnectPeer(args)),
    }),

    // ============================================================================
    // Lightning Network - Invoices & Payments
    // ============================================================================

    lnInvoice: builder.mutation<LNInvoiceResponse, LNInvoiceRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.createLNInvoice(args)),
    }),

    rgbInvoice: builder.mutation<RgbInvoiceResponse, RgbInvoiceRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.createRgbInvoice(args)),
    }),

    decodeInvoice: builder.query<DecodeLNInvoiceResponse, DecodeLNInvoiceRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.decodeLNInvoice(args)),
    }),

    decodeRgbInvoice: builder.query<DecodeRGBInvoiceResponse, DecodeRGBInvoiceRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.decodeRgbInvoice(args)),
    }),

    invoiceStatus: builder.query<InvoiceStatusResponse, InvoiceStatusRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.getInvoiceStatus(args)),
    }),

    sendPayment: builder.mutation<SendPaymentResponse, SendPaymentRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.sendPayment(args)),
    }),

    keysend: builder.mutation<KeysendResponse, KeysendRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.keysend(args)),
    }),

    listPayments: builder.query<ListPaymentsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listPayments()),
    }),

    // ============================================================================
    // Swaps
    // ============================================================================

    listSwaps: builder.query<ListSwapsResponse, void>({
      queryFn: createQueryFnVoid((wrapper) => wrapper.listSwaps()),
    }),

    whitelistTrade: builder.mutation<void, WhitelistTradeRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.whitelistTrade(args)),
    }),

    // ============================================================================
    // Maker Operations (using raw client for now)
    // ============================================================================

    makerInit: builder.mutation<MakerInitResponse, MakerInitRequest>({
      queryFn: async (args, api) => {
        try {
          const wrapper = await getNodeApiWrapper(api.getState() as MinimalState);
          // Access the underlying client for maker operations
          const res = await (wrapper as any).client.makerInit(args);
          return { data: res };
        } catch (e) {
          return { error: { status: 500, data: { error: String(e) } } };
        }
      },
    }),

    makerExecute: builder.mutation<void, MakerExecuteRequest>({
      queryFn: async (args, api) => {
        try {
          const wrapper = await getNodeApiWrapper(api.getState() as MinimalState);
          await (wrapper as any).client.makerExecute(args);
          return { data: undefined };
        } catch (e) {
          return { error: { status: 500, data: { error: String(e) } } };
        }
      },
    }),

    taker: builder.mutation<void, TakerRequest>({
      queryFn: async (args, api) => {
        try {
          const wrapper = await getNodeApiWrapper(api.getState() as MinimalState);
          await (wrapper as any).client.taker(args);
          return { data: undefined };
        } catch (e) {
          return { error: { status: 500, data: { error: String(e) } } };
        }
      },
    }),

    // ============================================================================
    // Utility Methods
    // ============================================================================

    signMessage: builder.mutation<SignMessageResponse, SignMessageRequest>({
      queryFn: createQueryFn((wrapper, args) => wrapper.signMessage(args)),
    }),
  }),
});

export const {
  useAddressQuery,
  useAssetBalanceQuery,
  useBackupMutation,
  useBtcBalanceQuery,
  useCloseChannelMutation,
  useConnectPeerMutation,
  useCreateUtxosMutation,
  useDecodeInvoiceQuery,
  useDecodeRgbInvoiceQuery,
  useDisconnectPeerMutation,
  useEstimateFeeQuery,
  useInitQuery,
  useInvoiceStatusQuery,
  useIssueNiaAssetMutation,
  useListAssetsQuery,
  useListChannelsQuery,
  useListPaymentsQuery,
  useListTransactionsQuery,
  useListTransfersQuery,
  useListUnspentsQuery,
  useLnInvoiceMutation,
  useMakerInitMutation,
  useMakerExecuteMutation,
  useTakerMutation,
  useNodeInfoQuery,
  useNetworkInfoQuery,
  useOpenChannelMutation,
  useRefreshMutation,
  useRestoreMutation,
  useRgbInvoiceMutation,
  useSendRgbMutation,
  useSendBtcMutation,
  useSendPaymentMutation,
  useSignMessageMutation,
  useUnlockQuery,
  useKeysendMutation,
  useListPeersQuery,
  useListSwapsQuery,
  useWhitelistTradeMutation,
  useShutdownQuery,
  useLockQuery,
} = nodeApi;
