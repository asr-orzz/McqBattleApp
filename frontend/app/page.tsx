"use client"
import { toastDismissAll, toastLoading, toastSuccess } from "@/utils/toast";


export default function Home() {
  function hehe(){
    toastLoading("User Created Succesfully");
  }
  function hehe2(){
    toastDismissAll();
  }
  return (
    <>
      <button onClick={()=>{hehe()}}>Click Me</button>
      <button onClick={()=>{hehe2()}}>Close all</button>
    </>
  );
}
