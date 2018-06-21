var app = new Vue({
    el:"#app",
    data:{
        msg:"test",
        beatInterval:0.25,
        row:36,
        column:256,
        soundList:[],
        sightX:1,
        sightY:1,
        mouseIn:false,
        moveTargetItem:undefined,
        stretchTargetItem:undefined,
        stretchPath:undefined,//false左true右

        startX:1,
        moveStartLineFlag:false,
    },
    methods:{
        inStartLine:()=>{
            app.hideSight()
        },
        markStartLine:()=>{
            app.moveStartLineFlag=true
        },
        moveStartLine:(evt)=>{
            app.startX=parseInt((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)
        },
        createItem:(event)=>{
            var self = this
            if(app.mouseIn&&app.moveTargetItem===undefined){
                app.soundList.push({
                    x:parseInt((event.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1),
                    y:parseInt(event.clientY/18+1),
                    length:1,
                    playing:false,
                })
                pianoSound(parseInt(event.clientY/18+1))
                console.log("create")
            }
            
        },
        inItem:(index)=>{
            app.hideSight()
        },
        markItem:(index)=>{//用在制定item的mouseDown事件，为之后的拖拽做准备
            app.moveTargetItem = index
        },
        unmark:()=>{
            app.moveTargetItem=undefined
            app.stretchTargetItem=undefined
            app.moveStartLineFlag=false
        },
        moveItem:(evt)=>{
            var x = parseInt((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)
            var y = parseInt(evt.clientY/18+1)
            if(app.soundList[app.moveTargetItem].x!=x||app.soundList[app.moveTargetItem].y!=y){
                app.soundList[app.moveTargetItem].x=x
                app.soundList[app.moveTargetItem].y=y
                app.sightX = x
                app.sightY = y
                pianoSound(y)
            }
            
            
        },
        markBorder:(index,path)=>{
            app.stretchTargetItem=index
            app.stretchPath=path
        },
        stretchItem:(evt)=>{
            if(app.stretchPath){//向右伸缩
                let result = Math.ceil((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)-app.soundList[app.stretchTargetItem].x
                if(result>0){
                    app.soundList[app.stretchTargetItem].length=result
                }
            }else{//向左伸缩
                let result = app.soundList[app.stretchTargetItem].x-parseInt((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)+app.soundList[app.stretchTargetItem].length
                if(result>0){
                    app.soundList[app.stretchTargetItem].length=result
                    
                    app.soundList[app.stretchTargetItem].x=parseInt((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)
                }
                
            }
        },
        deleteItem:(index)=>{
            if (confirm("是否删除该音符")) {
                app.soundList.splice(index,1)
            }
        },
        allMouseMove:(event)=>{
            var self = this;
            if(app.moveTargetItem!==undefined){
                app.moveItem(event)
            }else if(app.stretchTargetItem!==undefined){
                app.stretchItem(event)
            }else if(app.moveStartLineFlag){
                app.moveStartLine(event)
            }else{
                app.moveSight(event)
            }
        },
        showSight:(event)=>{
            if(event.buttons===0){
                app.mouseIn = true
            }
            
        },
        moveSight:(evt)=>{
            var x = parseInt((evt.clientX-getElementViewLeft(document.getElementById("mainPanel")))/30+1)
            var y = parseInt(evt.clientY/18+1)
            if(app.sightX!=x||app.sightY!=y){
                app.sightX = x
                app.sightY = y
                pianoSound(y)
            }
        },
        hideSight:()=>{
            app.mouseIn = false
            // app.sightX = 0
            // app.sightY = 0
        },

        playAll:function(){
            for(let i=0;i<app.soundList.length;i++){
                if(app.soundList[i].x>=app.startX){
                    setTimeout(function(){
                        app.soundList[i].playing=true
                        pianoSound(app.soundList[i].y)
                        setTimeout(() => {
                            app.soundList[i].playing=false
                        }, app.soundList[i].length*app.beatInterval*1000); 
                    },(app.soundList[i].x-app.startX)*app.beatInterval*1000)
                }
            }
        },
        deleteAll:function(){
            this.soundList=[]
        }

    },
    computed:{
        currentSound:function(){
            var order = parseInt((36-this.sightY)/12)
            if(order==0){
                order = "a"
            }else if(order==1){
                order = "b"
            }else if(order==2){
                order = "c"
            }
            var keyList = [1,1.5,2,2.5,3,4,4.5,5,5.5,6,6.5,7]
            return order + keyList[(36-this.sightY)%12]
        }
    }
})

var isSP, ctx, xml, data, frequencyRatioTempered, keyboards,rateList;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
ctx = new AudioContext();

xml = new XMLHttpRequest();
xml.responseType = 'arraybuffer';
xml.open('GET', 'https://lig-dsktschy.github.io/waapi-piano/piano/media/piano.wav', true);
xml.onload = function() {
    ctx.decodeAudioData(
        xml.response,
        function(_data) {
            data = _data;
        },
        function(e) {
            alert(e.err);
        }
    );
};
xml.send();
frequencyRatioTempered = 1.059463;
rateList = new Array(36)
rateList[24]=1
for(let i=23;i>=0;i--){
    rateList[i]=rateList[i+1]/frequencyRatioTempered
}
for(let i=25;i<36;i++){
    rateList[i]=rateList[i-1]*frequencyRatioTempered
}
function pianoSound(y){
    var bufferSource;
    bufferSource = ctx.createBufferSource();
    bufferSource.buffer = data;
    bufferSource.playbackRate.value = rateList[36-y];
    bufferSource.connect(ctx.destination);
    bufferSource.start(0);
}

function getElementViewLeft(element){
    var actualLeft = element.offsetLeft;
    var current = element.offsetParent;
    while (current !== null){
    　　actualLeft +=  (current.offsetLeft+current.clientLeft);
    　　current = current.offsetParent;
    }
    if (document.compatMode == "BackCompat"){
    　　var elementScrollLeft=document.body.scrollLeft;
    } else {
    　　var elementScrollLeft=document.documentElement.scrollLeft; 
    }
    return actualLeft-elementScrollLeft;
}
