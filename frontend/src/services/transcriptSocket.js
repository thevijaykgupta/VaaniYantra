let socket=null;

export function connectTranscriptSocket(roomId,onTranscript) {
    socket=new WebSocket(
        `ws://127.0.0.1:8000/ws/transcripts/${roomId}`
    );
    socket.onopen=()=>{
        console.log("📝 Transcript WebSocket connected");
    };

    socket.onmessage=(event)=>{
        const data=JSON.parse(event.data);
        if(data.type==="transcript"){
            onTranscript(data.payload);
        }
    };
    socket.onerror=(e)=>
        console.error("📝 Transcript WebSocket error:", e);
}