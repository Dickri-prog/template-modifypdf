const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken');

let templateData = [];

app.use(fileUpload());


app.use(cors({
  origin: ['https://seller-id.tiktok.com', 'https://seller.shopee.co.id', 'https://sellercenter.lazada.co.id']
}));


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, 'KYYKYKKY-ykkykyyk-578875', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.id = user.id;
    next();
  });
}


app.get('/template', authenticateToken, async (req, res) => {


  try {
      const userId = req.id
      const findTemplateIndex = templateData.findIndex((item) => item.id == userId)

      if (findTemplateIndex != -1) {
        const templateResult = templateData[findTemplateIndex]

        res.json(templateResult.templateFile)
      }else {
        // throw new Error("Template not found!!!")
        res.json({})
      }

  } catch (e) {
    // if (e.name == 'Error') {
    //   return res.json({
    //     status: "failed",
    //     message: e.message
    //   })
    // }

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })
  }

})

app.delete('/template', authenticateToken, async (req, res) => {

  try {
    const userId = req.id
    const findTemplateIndex = templateData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      templateData.splice(findTemplateIndex, 1);
      res.json({
        status: "success",
        message: "removing Template Succesfully!!!"
      })
    }else {
      throw new Error("Template not found!!!")
    }
  } catch (e) {
    if (e.name == 'Error') {
      return res.json({
        status: "failed",
        message: e.message
      })
    }

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })
  }


})

app.post('/template', authenticateToken, async (req, res) => {

  try {
    const userId = req.id
    const templateFileName = req.body.name
    const findTemplateIndex = templateData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      throw new Error("Template Already exists!!!")
    }else {

      const templateFile = req.files.templateFile

      const templateFileBuffer = templateFile.data

      const templateFileSplit = templateFile.mimetype.split('/')

      const base64String = templateFileBuffer.toString('base64');

      const arrayImageExt = [
        'png',
        'jpg',
        'jpeg',
      ]

      if (arrayImageExt.indexOf(templateFileSplit[1]) != -1) {
        const concateBase64 = "data::image/" + templateFileSplit[1] + ";base64," + base64String

        const data = {
          id: userId,
          templateFile: {
            name:   templateFileName,
            base64: concateBase64
          }
        }

        templateData.push(data)

        res.json({
          status: "success",
          message: "Adding Template Succesfully!!!"
        })
      }else {
        res.json({
          status: "failed",
          message: "template File Template not supported!!!"
        })
      }
    }
  } catch (e) {
    if (e.name == 'Error') {
      return res.json({
        status: "failed",
        message: e.message
      })
    }

    console.error(e.message)

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })

  }

})


const port = 3000
app.listen(port, () => console.log(`Running on port ${port}`))
