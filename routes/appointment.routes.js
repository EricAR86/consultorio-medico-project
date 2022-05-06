const router = require("express").Router()
const abletoappointment = require("../middleware/abletoappointment");
const Appointment = require("../models/Appointment.model");
const Service = require("../models/Service.model");
const { populate } = require("../models/User.model");
const User = require("../models/User.model");


// Enviar formulario

router.get("/new/appointment", abletoappointment, (req, res, next) => {
    const isAdmin = req.session?.user?.profile=="admin" ? true : false
    const isLoggedIn = req.session?.user ? true :false
    const username = req.session?.user?.username
    const avatar=req.session?.user?.avatar
    Service.find()
        .then(services => {
            res.render("appointment/appointment-create", {services,isAdmin,isLoggedIn,username,avatar})
        })
        .catch(error => console.log(error))
    
})

// Recibir datos

router.post("/new/appointment", (req, res, next) => {
    console.log(req.session?.user?._id)

    const appointment = {...req.body, idUser: req.session?.user?._id}
    const userId = req.session?.user?._id
    Appointment.create(appointment)
        .then(appointment => {
            Service.findById(appointment.idService)
                .then(serviceFound => {
                        res.render("appointment/appointment-details", {appointment, serviceFound})
                    })
                    .catch(error => console.log(error))
                    
        return User.findByIdAndUpdate(userId, {$push: {appointment: appointment._id}})
        })
        .catch(error => console.log(error))
})

//revisar todas las citas
router.get('/appointment/list',(req,res)=>{
    Appointment.find()
    .populate("idUser")
    .then(registeredAppointments=>{
        const isAdmin = req.session?.user?.profile=="admin" ? true : false
        const isLoggedIn = req.session?.user ? true :false
        const username = req.session?.user?.username
        const avatar=req.session?.user?.avatar

        res.render('appointment/appointment-list', {data:registeredAppointments,isAdmin,isLoggedIn,username,avatar} )
    })
    .catch(err=>(console.log("Error en find: ",err)))
})

//rechazar citas

router.get("/appointment/:id/edit",(req,res,next)=>{
    const isAdmin = req.session?.user?.profile=="admin" ? true : false
    const isLoggedIn = req.session?.user ? true :false
    const username = req.session?.user?.username
    const avatar=req.session?.user?.avatar
    const{id}=req.params
    Appointment.findById(id)
    .then(appointment=>{
        res.render("appointment/appointment-edit",{appointment,isAdmin,isLoggedIn,username,avatar})
    })
    .catch(err=>console.log(err))
})


router.post("/appointment/:id/delete", (req,res,next)=>{
    const {id} = req.params
    Appointment.findByIdAndDelete(id)
    .then(()=>{
        console.log("cita borrada")
        res.redirect("/appointment/list")
    })
    .catch(err=>console.log(err))
})


module.exports = router