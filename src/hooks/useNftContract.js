import { useContract } from "./useContract";
import AbstractionAbi from "../contracts/Abstraction.json";
import AbstractionAddress from "../contracts/Abstraction-address.json";

export const useNftContract = () =>{
 return useContract( AbstractionAbi.abi, AbstractionAddress.Abstraction);
}
