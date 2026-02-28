import {useNavigate} from "react-router-dom";

export default function useSafeBack(fallback="/"){
  const navigate=useNavigate();
  return ()=>{
    if(window.history.length>1){
      navigate(-1);
    }else{
      navigate(fallback);
    }
  };
}
