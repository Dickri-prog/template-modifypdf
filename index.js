const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken');
const { Octokit } = require("octokit");

let templatesData = [];

let shaData = null
let fetchedData = false

app.use(fileUpload());


app.use(cors({
  origin: "*"
}));



const octokit = new Octokit({
  auth: process.env.githubSecretKey
})

async function fetchContentFile() {
  const fetchingData = await octokit.request('GET /repos/Dickri-prog/jsonData/contents/template-modifypdf/templatesData.json', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    path: 'template-modifypdf/templatesData.json',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }).then((result) => {
    shaData = result['data']['sha']
    const base64Data = result['data']['content']
    const buffer = Buffer.from(base64Data, 'base64');
    const originalString = buffer.toString();
    //
    templatesData = JSON.parse(originalString)
    console.log("fetched")
    return true
  }).catch(error => {
    console.error(error.message)
    return false
  })

  return fetchingData
}

function checkingData(req, res, next) {

  if (fetchedData === false) {
    fetchedData = fetchContentFile().then(result => {
      if (result) {
        next()
      } else {

        return res.json({
          isLoggedin: false,
          message: "Something Wrong, contact us"
        })
      }
    })
  } else {
    next()
  }
}

async function updateFile() {
  const updatedContent = Buffer.from(JSON.stringify(templatesData, null, 2)).toString('base64');
  const updatedData = await octokit.request('PUT /repos/Dickri-prog/jsonData/contents/template-modifypdf/templatesData.json', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    sha: shaData,
    path: 'template-modifypdf/templatesData.json',
    message: 'update templatesData.json',
    content: updatedContent,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
    .then(result => {
      shaData = result['data']['content']['sha']
      return true
    })
    .catch(error => {
      console.error(error.message);
      return false
    })

  return updatedData
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.webTokenSecretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.id = user.id;
    next();
  });
}


app.get('/template', [checkingData, authenticateToken], async (req, res) => {
  console.log("getted")
  try {
    const userId = req.id
    const findTemplateIndex = templatesData.findIndex((item) => item.id == userId)

    if (findTemplateIndex != -1) {
      const templateResult = templatesData[findTemplateIndex]

      res.json(templateResult.templateFile)
    } else {
      res.json({})
    }

  } catch (e) {

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })
  }

})

app.delete('/template', [checkingData, authenticateToken], async (req, res) => {

  try {
    const userId = req.id
    const findTemplateIndex = templatesData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      templatesData.splice(findTemplateIndex, 1);

      const updatedContent = await updateFile()

      if (updatedContent) {
        res.json({
          status: "success",
          message: "removing Template Succesfully!!!"
        })
      } else {
        res.json({
          status: "failed",
          message: "Someting wrong!!!"
        })
      }


    } else {
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

app.post('/template', [checkingData, authenticateToken], async (req, res) => {

  try {
    const userId = req.id
    const templateFileName = req.body.name
    const findTemplateIndex = templatesData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      throw new Error("Template Already exists!!!")
    } else {

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

        const data = {
          id: userId,
          templateFile: {
            name: templateFileName,
            base64: base64String
          }
        }

        templatesData.push(data)

        const updatedContent = await updateFile()

        if (updatedContent) {
          res.json({
            status: "success",
            message: "Adding Template Succesfully!!!"
          })
        } else {
          res.json({
            status: "failed",
            message: "Upload Failed!!!"
          })
        }
      } else {
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

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })

  }

})


const port = 3000
app.listen(port, () => console.log(`Running on port ${port}`))
const express = require('express')
const app = express()
const cors = require('cors');
const fileUpload = require('express-fileupload')
const jwt = require('jsonwebtoken');
const { Octokit } = require("octokit");

let templatesData = [];

let shaData = null
let fetchedData = false

app.use(fileUpload());


app.use(cors({
  origin: "*"
}));



const octokit = new Octokit({
  auth: process.env.githubSecretKey
})

async function fetchContentFile() {
  const fetchingData = await octokit.request('GET /repos/Dickri-prog/jsonData/contents/template-modifypdf/templatesData.json', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    path: 'template-modifypdf/templatesData.json',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  }).then((result) => {
    shaData = result['data']['sha']
    const base64Data = result['data']['content']
    const buffer = Buffer.from(base64Data, 'base64');
    const originalString = buffer.toString();
    //
    templatesData = JSON.parse(originalString)
    console.log("fetched")
    return true
  }).catch(error => {
    console.error(error.message)
    return false
  })

  return fetchingData
}

function checkingData(req, res, next) {

  if (fetchedData === false) {
    fetchedData = fetchContentFile().then(result => {
      if (result) {
        next()
      } else {

        return res.json({
          isLoggedin: false,
          message: "Something Wrong, contact us"
        })
      }
    })
  } else {
    next()
  }
}

async function updateFile() {
  const updatedContent = Buffer.from(JSON.stringify(templatesData, null, 2)).toString('base64');
  const updatedData = await octokit.request('PUT /repos/Dickri-prog/jsonData/contents/template-modifypdf/templatesData.json', {
    owner: 'Dickri-prog',
    repo: 'jsonData',
    sha: shaData,
    path: 'template-modifypdf/templatesData.json',
    message: 'update templatesData.json',
    content: updatedContent,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
    .then(result => {
      shaData = result['data']['content']['sha']
      return true
    })
    .catch(error => {
      console.error(error.message);
      return false
    })

  return updatedData
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.webTokenSecretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.id = user.id;
    next();
  });
}


app.get('/template', [checkingData, authenticateToken], async (req, res) => {
  console.log("getted")
  try {
    const userId = req.id
    const findTemplateIndex = templatesData.findIndex((item) => item.id == userId)

    if (findTemplateIndex != -1) {
      const templateResult = templatesData[findTemplateIndex]

      res.json(templateResult.templateFile)
    } else {
      res.json({})
    }

  } catch (e) {

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })
  }

})

app.delete('/template', [checkingData, authenticateToken], async (req, res) => {

  try {
    const userId = req.id
    const findTemplateIndex = templatesData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      templatesData.splice(findTemplateIndex, 1);

      const updatedContent = await updateFile()

      if (updatedContent) {
        res.json({
          status: "success",
          message: "removing Template Succesfully!!!"
        })
      } else {
        res.json({
          status: "failed",
          message: "Someting wrong!!!"
        })
      }


    } else {
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

app.post('/template', [checkingData, authenticateToken], async (req, res) => {

  try {
    const userId = req.id
    const templateFileName = req.body.name
    const findTemplateIndex = templatesData.findIndex(item => item.id == userId)

    if (findTemplateIndex != -1) {
      throw new Error("Template Already exists!!!")
    } else {

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

        const data = {
          id: userId,
          templateFile: {
            name: templateFileName,
            base64: base64String
          }
        }

        templatesData.push(data)

        const updatedContent = await updateFile()

        if (updatedContent) {
          res.json({
            status: "success",
            message: "Adding Template Succesfully!!!"
          })
        } else {
          res.json({
            status: "failed",
            message: "Upload Failed!!!"
          })
        }
      } else {
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

    res.json({
      status: "failed",
      message: "Something wrong!!!"
    })

  }

})


const port = 3000
app.listen(port, () => console.log(`Running on port ${port}`))
