import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { Alchemy, Network, TokenBalancesResponseErc20 } from "alchemy-sdk";
import { FormEvent, useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { isAddress } from "ethers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
// apiKey should store in .env
const config = {
  apiKey: "fRnoP5jll4MdDRRrdmrrtN_tWHXcO89p",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

const ADDS = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

type IFormInput = {
  address: string;
};

type Token = {
  tokenBalance: string;
  contractAddress: string;
  symbol: string | null;
  name: string | null;
  logo: string | null;
};

export const Wallet = () => {
  const [balances, setBalances] = useState<Token[] | null>();
  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
    setError,
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const { address } = data;

    if (!isAddress(address)) {
      setError("address", {
        type: "custom",
        message: "Please input valid Add",
      });
      return;
    }

    const balances = await alchemy.core.getTokenBalances(address);

    const non0tokens = balances.tokenBalances.filter(({ tokenBalance }) => {
      return Number(tokenBalance) !== 0;
    });

    const tokens = new Array<Token>();

    for (let token of non0tokens) {
      const { tokenBalance, contractAddress } = token;
      const metadata = await alchemy.core.getTokenMetadata(contractAddress);

      //   console.log(metadata);
      const balance =
        Number(tokenBalance) / Math.pow(10, metadata.decimals ?? 0);

      tokens.push({
        tokenBalance: balance.toFixed(2),
        contractAddress,
        symbol: metadata.symbol,
        name: metadata.name,
        logo: metadata.logo,
      });

      console.log(tokens);
    }
    setBalances(tokens);
  };

  return (
    <div className="backdrop-blur bg-black/20 text-white rounded-md shadow-md w-full max-w-xl min-h-40 px-5 py-5 space-y-5 divide-y-2 divide-gray-300">
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4">
          <Input {...register("address")} placeholder="0x" />
          <Button type="submit">Submit</Button>
        </form>
        {errors.address && (
          <span className="text-red-400 text-sm">{errors.address.message}</span>
        )}
      </div>

      {isSubmitting && (
        <div className="flex flex-col px-4 divide-y-2">
          {new Array(3).fill(0).map((_, idx) => {
            return <WalletSkeleton key={idx} />;
          })}
        </div>
      )}
      {!!balances && (
        <div className="flex flex-col px-4 divide-y-2">
          {balances.map((token, idx) => {
            return (
              <div
                className="min-h-10 flex gap-4 items-center mb-2 pt-2"
                key={idx}
              >
                <Avatar>
                  <AvatarImage src={String(token.logo) ?? null} />
                  <AvatarFallback>
                    {token.name?.slice(0, 2) ?? null}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <span>
                    {token.tokenBalance} {token.symbol ?? ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const WalletSkeleton = () => {
  return (
    <div className="min-h-10 flex gap-4 items-center mb-2 pt-2">
      <div className="w-10 h-10">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>

      <Skeleton className="w-1/2 h-4 rounded-full" />
    </div>
  );
};
