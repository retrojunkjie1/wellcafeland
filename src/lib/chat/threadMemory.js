let threadStore={};

export function getThreadMemory(threadId){
  return threadStore[threadId]||[];
}

export function appendThreadMemory(threadId,message){
  if(!threadStore[threadId]){
    threadStore[threadId]=[];
  }
  threadStore[threadId].push(message);
}
