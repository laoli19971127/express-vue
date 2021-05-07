var express = require('express');
let muter = require('multer')
let upload = muter({dest:"./public/upload/"})
var router = express.Router();
var student = require('../controllers/studentController')
var role = require('../controllers/roleController')
var menu = require('../controllers/menuController')
/* GET home page. */
router.get('/getUser/', student.getStudent);
router.get('/getStudentBytoken/',student.getStudentBytoken);
router.get('/getStudentByName/',student.getStudentByName)
router.post('/register',student.userRegister);
router.post('/login',student.userLogin)
router.get('/role/',role.getRoles)
router.post('/insertUserRole',role.insertUserRole)
router.get('/getMenu/',menu.getMenu)
router.get('/updataStatus/',menu.upDataStatus)
router.post('/insertRoleMenu',role.insertRoleMenu)
router.post('/importExcle',upload.single('file'),student.importExport)
router.post('/exportExcel',student.exportExcel)
router.get('/getCaptcha/',student.getCaptcha)
module.exports = router;
