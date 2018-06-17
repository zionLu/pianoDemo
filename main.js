var app = new Vue({
    el:"#app",
    data:{
        msg:"test",
        row:21,
        column:64,
        soundList:[],
        sightX:1,
        sightY:1,
        mouseIn:false,
    },
    methods:{
        createItem:(event)=>{
            var self = this;
            app.$data.mouseIn = true,
            app.$data.sightX = parseInt(event.clientX/30+1)
            app.$data.sightY = parseInt(event.clientY/18+1)
            app.soundList.push({
                x:parseInt(event.clientX/30+1),
                y:parseInt(event.clientY/18+1),
                length:1,
            })
        },
        moveItem:(index)=>{
            
        },
        showSight:(event)=>{
            var self = this;
            app.mouseIn = true,
            app.sightX = parseInt(event.clientX/30+1)
            app.sightY = parseInt(event.clientY/18+1)
        },
        hideSight:(event)=>{
            var self = this;
            app.mouseIn = false,
            app.sightX = 1
            app.sightY = 1
        },

    }
})