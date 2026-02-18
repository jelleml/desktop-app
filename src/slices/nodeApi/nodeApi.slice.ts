import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getKaleidoClient, MinimalState } from '../../api/client';
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
  ListTransfersRequest,
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
  SendAssetResponse,
  SendAssetRequest,
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
  SwapDetails,
  Transfer
} from './types';

export { SwapStatus } from './types';



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

export const nodeApi = createApi({
  reducerPath: 'nodeApi',
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    address: builder.query<AddressResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getAddress();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    assetBalance: builder.query<AssetBalanceResponse, AssetBalanceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getAssetBalance(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    backup: builder.mutation<void, BackupRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.backup(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    btcBalance: builder.query<BtcBalanceResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getBtcBalance(false);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    closeChannel: builder.mutation<void, CloseChannelRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.closeChannel(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    connectPeer: builder.mutation<void, ConnectPeerRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.connectPeer(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    createUtxos: builder.mutation<void, CreateUtxosRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.createUtxos({
            up_to: false,
            skip_sync: false,
            ...args
          });
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    decodeInvoice: builder.query<DecodeLNInvoiceResponse, DecodeLNInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.decodeLNInvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    decodeRgbInvoice: builder.query<DecodeRGBInvoiceResponse, DecodeRGBInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.decodeRgbInvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    disconnectPeer: builder.mutation<void, DisconnectPeerRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.disconnectPeer(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    estimateFee: builder.query<EstimateFeeResponse, EstimateFeeRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.estimateFee(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    init: builder.query<void, InitRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.initWallet(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    invoiceStatus: builder.query<InvoiceStatusResponse, InvoiceStatusRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getInvoiceStatus(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    issueNiaAsset: builder.mutation<IssueAssetNIAResponse, IssueAssetNIARequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.issueAssetNIA(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listAssets: builder.query<ListAssetsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listAssets();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listChannels: builder.query<ListChannelsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listChannels();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listPayments: builder.query<ListPaymentsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listPayments()
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listTransactions: builder.query<ListTransactionsResponse, { skip_sync?: boolean } | void>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          // Type assertion needed until SDK types are regenerated
          const res = await (client.rln.listTransactions as (req?: { skip_sync?: boolean }) => Promise<ListTransactionsResponse>)(args || {});
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listTransfers: builder.query<ListTransfersResponse, ListTransfersRequest | void>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listTransfers(args || {});
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listUnspents: builder.query<ListUnspentsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listUnspents();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    lnInvoice: builder.mutation<LNInvoiceResponse, LNInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const requestBody = args.asset_id
            ? {
              amt_msat: 3000000,
              asset_amount: args.asset_amount,
              asset_id: args.asset_id,
              expiry_sec: 3600,
            }
            : args.amt_msat
              ? {
                amt_msat: args.amt_msat,
                expiry_sec: 3600,
              }
              : {
                expiry_sec: 3600,
              };
          const res = await client.rln.createLNInvoice(requestBody);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),


    // ... inside endpoints
    makerInit: builder.mutation<MakerInitResponse, MakerInitRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await (client.rln as any).makerInit(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    makerExecute: builder.mutation<void, MakerExecuteRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await (client.rln as any).makerExecute(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    taker: builder.mutation<void, TakerRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await (client.rln as any).taker(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    nodeInfo: builder.query<NodeInfoResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getNodeInfo();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    networkInfo: builder.query<NetworkInfoResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.getNetworkInfo();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    openChannel: builder.mutation<OpenChannelResponse, OpenChannelRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const requestBody: any = {
            peer_pubkey_and_opt_addr: args.peer_pubkey_and_opt_addr,
            capacity_sat: args.capacity_sat,
            push_msat: 3100000,
            public: args.public !== undefined ? args.public : true,
            with_anchors: true,
            fee_base_msat: args.fee_base_msat,
            fee_proportional_millionths: args.fee_proportional_millionths,
            ...(args.temporary_channel_id ? { temporary_channel_id: args.temporary_channel_id } : {}),
          };

          // Only add asset fields if asset_amount is provided and > 0
          if (args.asset_amount && args.asset_amount > 0) {
            requestBody.asset_amount = Math.floor(args.asset_amount); // Ensure integer
            requestBody.asset_id = args.asset_id;
          }

          const res = await client.rln.openChannel(requestBody);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    refresh: builder.mutation<void, RefreshRequest | void>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.refreshTransfers({ skip_sync: false, ...(args || {}) });
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    restore: builder.mutation<void, RestoreRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.restore(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    rgbInvoice: builder.mutation<RgbInvoiceResponse, RgbInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const requestBody: any = {
            min_confirmations: 1,
            ...(args.asset_id ? { asset_id: args.asset_id } : {}),
            ...(args.witness !== undefined ? { witness: args.witness } : {}),
            ...(args.assignment ? { assignment: args.assignment } : {}),
          };
          const res = await client.rln.createRgbInvoice(requestBody);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendAsset: builder.mutation<SendAssetResponse, SendAssetRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.sendAsset({
            asset_id: args.asset_id,
            assignment: args.assignment,
            recipient_id: args.recipient_id,
            donation: args.donation || false,
            fee_rate: args.fee_rate,
            min_confirmations: 1,
            transport_endpoints: args.transport_endpoints,
            skip_sync: false,
            ...(args.witness_data ? { witness_data: args.witness_data } : {}),
          });
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendBtc: builder.mutation<void, SendBtcRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.sendBtc({ skip_sync: false, ...args });
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendPayment: builder.mutation<SendPaymentResponse, SendPaymentRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.sendPayment(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    signMessage: builder.mutation<SignMessageResponse, SignMessageRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.signMessage(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    unlock: builder.query<void, UnlockRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.unlockWallet(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    keysend: builder.mutation<KeysendResponse, KeysendRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.keysend(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listPeers: builder.query<ListPeersResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listPeers()
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listSwaps: builder.query<ListSwapsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          const res = await client.rln.listSwaps()
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    whitelistTrade: builder.mutation<void, WhitelistTradeRequest>({
      queryFn: async (args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.whitelistTrade(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    shutdown: builder.query<void, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.shutdown();
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    lock: builder.query<void, void>({
      queryFn: async (_args, api) => {
        try {
          const client = await getKaleidoClient(api.getState() as MinimalState);
          await client.rln.lockWallet();
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
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
  useSendAssetMutation,
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
