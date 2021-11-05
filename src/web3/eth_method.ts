import { BaseContractMethod, Logger, ITransactionConfig, Converter } from "@maticnetwork/maticjs";
import Web3 from "web3";
import { TransactionObject, Tx } from "web3/eth/types";
import { doNothing } from "../helpers";

export class EthMethod extends BaseContractMethod {

    constructor(public address, logger: Logger, private method: TransactionObject<any>) {
        super(logger);
    }

    toHex(value) {
        return value != null ? Web3.utils.toHex(value) : value;
    }

    private toConfig_(config: ITransactionConfig = {}) {
        const toHex = this.toHex;
        return {
            chainId: toHex(config.chainId),
            data: config.data,
            from: config.from,
            gas: config.gasLimit,
            gasPrice: config.gasPrice,
            nonce: config.nonce,
            to: config.to,
            value: config.value,
            maxFeePerGas: config.maxFeePerGas,
            maxPriorityFeePerGas: config.maxPriorityFeePerGas,
            type: toHex(config.type),
            hardfork: config.hardfork
        } as Tx;
    }

    read<T>(tx: ITransactionConfig): Promise<T> {
        this.logger.log("sending tx with config", tx);
        return this.method.call(
            this.toConfig_(tx)
        );
    }

    write(tx: ITransactionConfig) {
        const result = {
            onTransactionHash: (doNothing as any),
            onReceipt: doNothing,
            onReceiptError: doNothing,
            onTxError: doNothing
        };
        setTimeout(() => {
            this.logger.log("sending tx with config", tx);
            this.method.send(
                this.toConfig_(tx)
            ).once("transactionHash", result.onTransactionHash).
                once("receipt", result.onReceipt).
                on("error", result.onTxError).
                on("error", result.onReceiptError);
        }, 0);
        return result;
    }

    estimateGas(tx: ITransactionConfig): Promise<number> {
        return this.method.estimateGas(tx as any);
    }

    encodeABI() {
        return this.method.encodeABI();
    }

}
