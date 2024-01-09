import { AccountError, AccountErrorCode } from "../errors";
import { getAnchorProvider } from "../utils/provider";
import { RPC_LOOK_UP_TABLE } from "../config";

export async function getLookUpTable(_req: any, res: any): Promise<string> {
  try {
    const contents = RPC_LOOK_UP_TABLE;
    const provider = await getAnchorProvider();
    const info = await provider.connection.getAccountInfo(contents);
    console.log("@getLookUpTable accInfo:", info, "pub:", contents);
    if (!info)
      throw new AccountError(
        AccountErrorCode.LOOK_UP_TABLE_NOT_INITIALIZED,
        "getLookUpTable",
      );
    return res.status(200).json({ data: contents });
  } catch (e) {
    console.log("@getLookUpTable error: ", e);
    return res.status(500).json({ status: "error", message: e.message });
  }
}