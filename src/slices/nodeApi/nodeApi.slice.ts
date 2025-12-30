import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { getKaleidoClient } from '../../api/client';
import { RootState } from '../../app/store';
import {
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
  DecodeRGBInvoiceResponse,
  DecodeRGBInvoiceRequest,
  DisconnectPeerRequest,
  EstimateFeeResponse,
  EstimateFeeRequest,
  InitResponse,
  InitRequest,
  InvoiceStatusResponse,
  InvoiceStatusRequest,
  IssueAssetNIAResponse,
  IssueAssetNIARequest,
  ListAssetsResponse,
  ListChannelsResponse,
  ListPaymentsResponse,
  ListTransactionsResponse,
  ListTransfersResponse,
  ListUnspentsResponse,
  LNInvoiceResponse,
  LNInvoiceRequest,
  // RgbNodeInfoResponse was exported from SDK index.ts so we use it directly
  RgbNodeInfoResponse,
  OpenChannelResponse,
  OpenChannelRequest,
  RefreshRequest,
  RestoreRequest,
  RgbInvoiceResponse,
  RgbInvoiceRequest,
  SendAssetResponse,
  SendAssetRequest,
  SendBtcResponse,
  SendBtcRequest,
  SendPaymentResponse,
  SendPaymentRequest,
  SignMessageResponse,
  SignMessageRequest,
  UnlockRequest,
  KeysendResponse,
  KeysendRequest,
  ListPeersResponse,
} from 'kaleidoswap-sdk';

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
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postAddress();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    assetBalance: builder.query<AssetBalanceResponse, AssetBalanceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postAssetbalance(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    backup: builder.query<void, BackupRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.other.postBackup(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    btcBalance: builder.query<BtcBalanceResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postBtcbalance({ skip_sync: false });
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    closeChannel: builder.query<void, CloseChannelRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.channels.postClosechannel(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    connectPeer: builder.mutation<void, ConnectPeerRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await (client.node.peers as any).postConnectpeer(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    createUTXOs: builder.query<void, CreateUtxosRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.rgb.postCreateutxos(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    decodeInvoice: builder.query<DecodeLNInvoiceResponse, DecodeLNInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.invoices.postDecodelninvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    decodeRgbInvoice: builder.query<DecodeRGBInvoiceResponse, DecodeRGBInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postDecodergbinvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    disconnectPeer: builder.mutation<void, DisconnectPeerRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await (client.node.peers as any).postDisconnectpeer(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    estimateFee: builder.query<EstimateFeeResponse, EstimateFeeRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postEstimatefee(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    init: builder.query<InitResponse, InitRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.other.postInit(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    invoiceStatus: builder.query<InvoiceStatusResponse, InvoiceStatusRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.invoices.postInvoicestatus(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    issueNiaAsset: builder.mutation<IssueAssetNIAResponse, IssueAssetNIARequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postIssueassetnia(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listAssets: builder.query<ListAssetsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postListassets({});
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listChannels: builder.query<ListChannelsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.channels.getListchannels();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listPayments: builder.query<ListPaymentsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.payments.getListpayments();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listTransactions: builder.query<ListTransactionsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postListtransactions();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listTransfers: builder.query<ListTransfersResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postListtransfers(undefined);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listUnspents: builder.query<ListUnspentsResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postListunspents({});
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    lnInvoice: builder.mutation<LNInvoiceResponse, LNInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.invoices.postLninvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    nodeInfo: builder.query<RgbNodeInfoResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.other.getNodeinfo();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    openChannel: builder.mutation<OpenChannelResponse, OpenChannelRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.channels.postOpenchannel(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    refresh: builder.mutation<void, RefreshRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.rgb.postRefreshtransfers(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    restore: builder.query<void, RestoreRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.other.postRestore(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    rgbInvoice: builder.mutation<RgbInvoiceResponse, RgbInvoiceRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postRgbinvoice(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendAsset: builder.mutation<SendAssetResponse, SendAssetRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.rgb.postSendasset(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendBtc: builder.mutation<SendBtcResponse, SendBtcRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.onChain.postSendbtc(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    sendPayment: builder.mutation<SendPaymentResponse, SendPaymentRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.payments.postSendpayment(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    signMessage: builder.mutation<SignMessageResponse, SignMessageRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.other.postSignmessage(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    unlock: builder.query<void, UnlockRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          await client.node.other.postUnlock(args);
          return { data: undefined };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    keysend: builder.mutation<KeysendResponse, KeysendRequest>({
      queryFn: async (args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.payments.postKeysend(args);
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
    listPeers: builder.query<ListPeersResponse, void>({
      queryFn: async (_args, api) => {
        try {
          const client = getKaleidoClient(api.getState() as RootState);
          const res = await client.node.peers.getListpeers();
          return { data: res };
        } catch (e) { return { error: { status: 500, data: { error: String(e) } } }; }
      },
    }),
  }),
});
