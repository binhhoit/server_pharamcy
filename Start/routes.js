'use strict';
//id = email 
const auth = require('basic-auth');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const fileType = require('file-type')
const fs = require('fs')

const responseData = require('./models/Responsive');
const errors = require('./models/Errors');

const register = require('./functions/register');
const login = require('./functions/login');
const profile = require('./functions/profile');
const password = require('./functions/password');
const updateUser = require('./functions/updateUser');

const config = require('./config/config.json');

const drugstore_get = require('./functions/drug_store_get');
const drugstore_post = require('./functions/drug_store_post');
const drugstore_delete = require('./functions/drug_store_delete');
const prescription_post = require('./functions/prescription_post');
const prescriptionPhoto_post = require('./functions/prescriptionPhoto_post');
const prescription_get = require('./functions/prescription_get');
const prescription_get_confirm = require('./functions/prescription_get_confirm');
const prescription_put_confirm = require('./functions/prescription_put_confirm');
const photo = require('./functions/uploadPhoto');

const pay = require('./functions/Pay');

module.exports = router => {

	router.get('/', (req, res) => res.end('Welcome to Thanh Binh!'));

	router.post('/users/authenticate', (req, res) => {
		//get request lấy giá trị thông tin user
		const credentials = auth(req);
		console.log("--> run login\n" + credentials.name);
		if (!credentials) {

			res.json(responseData(null, true, errors(2240, 'Invalid Request !')));

		} else {
			// gọi bên login.js loginUser
			login.loginUser(credentials.name, credentials.pass)

				.then(result => {

					const token = jwt.sign(result, config.secret, { expiresIn: 1440 });
					/* res.status(result.status).json({ message: result.message, token: token, id: result.id });*/

					var data = {
						email: result.message,
						token_type: "Base ",
						access_token: token,
						_id: result.id
					}

					var response = responseData(data, null, errors(null, null));

					console.log(response);
					res.json(response);
				})

				.catch(err => res.json(responseData(null, true, err)));
		}
	});

	router.post('/users/register', (req, res) => {

		const name = req.body.name;
		const email = req.body.email;
		const password = req.body.password;
		//hàm trim() loại bỏ khảng trắng
		if (!name || !email || !password || !name.trim() || !email.trim() || !password.trim()) {

			res.status(400).json({ message: 'Invalid Request !' });

		} else {

			register.registerUser(name, email, password)

				.then(result => {

					res.setHeader('Location', '/users/' + email);
					res.status(result.status).json({ message: result.message })
				})

				.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	router.get('/users/:id', (req, res) => {

		if (checkToken(req)) {

			profile.getProfile(req.params.id)

				.then(result => {
					res.json(responseData(result, null, errors(null, null)));
				})

				.catch(err => {
					res.json(responseData(null, true, err));
				});

		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}

	});

	router.put('/users/:id', (req, res) => {

		if (checkToken(req)) {

			const oldPassword = req.body.password;
			const newPassword = req.body.newPassword;

			if (!oldPassword || !newPassword || !oldPassword.trim() || !newPassword.trim()) {

				res.status(400).json({ message: 'Invalid Request !' });

			} else {

				password.changePassword(req.params.id, oldPassword, newPassword)

					.then(result => {
						res.json({ data: result.message, error: null, errors: null });
					})
					.catch(err => {
						res.json(responseData(null, true, err));
					});

			}
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}
	});

	router.put('/auth/update', (req, res) => {
		if (checkToken(req)) {
			updateUser.updateProfile(req.body)

				.then(result => {
					console.log(result);
					res.json({ data: result, error: null, errors: null });
				})
				.catch(err => {
					console.log(err);
					var response = responseData(null, true, errors(2500, 'Internal Server Error !'));
					res.json(response);
				});

		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}

	});

	router.post('/users/:email/password', (req, res) => {

		const email = req.params.email;
		const token = req.body.token;
		const newPassword = req.body.password;

		if (!token || !newPassword || !token.trim() || !newPassword.trim()) {

			password.resetPasswordInit(email)

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.json(responseData(null, true, err)));

		} else {

			password.resetPasswordFinish(email, token, newPassword)

				.then(result => res.status(result.status).json({ message: result.message }))

				.catch(err => res.status(err.status).json({ message: err.message }));
		}
	});

	router.get('/deeplink/:email/:code', (req, res) => {
		const email = req.params.email;
		const code = req.params.code;
		res.redirect('onlinephamacy://reset/' + email + '/' + code);
	});

	function checkToken(req) {

		const token = req.headers['x-access-token'];
		if (token) {

			try {
				var decoded = jwt.verify(token, config.secret);

				if (req.params.id != null) {
					return decoded.id === req.params.id;
				} else {
					return decoded.id === req.body._id;
				}

			} catch (err) {
				return false;
			}

		} else {
			return false;
		}
	}
	//--------------------------------------Web---------------------------------------------------
	router.get('/drugstore', (req, res) => {

		res.render(__dirname + ("/view/drugstore.ejs"))
	});

	router.get('/drugstorelist', (req, res) => {

		drugstore_get.drug_store_get()

			.then(result => res.json(result))

			.catch(err => res.status(err.status).json({ message: err.message }));


	});

	router.post('/drugstorelist', (req, res) => {

		drugstore_post.drug_store_post(req.body)
			.then(result => {
				res.json(result);
			})

	});

	router.delete('/drugstorelist/:id', (req, res) => {
		var id = req.params.id;
		drugstore_delete.drug_store_delete(id)
			.then(result => {
				res.json(result);
			})
	});

	//------------------------------prescription (đơn thuốc)----------------------------------

	router.get('/prescription/:id', (req, res) => {
		if (checkToken(req)) {
			prescription_get.prescriptionGet(req.params.id)
				.then(result => {
					var response = responseData(result, null, errors(null, null));
					res.json(response);
				})
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}
	});

	// lấy đơn thuốc xác thực trên di động.
	router.get('/prescription/:id/:boolean', (req, res) => {

		if (checkToken(req)) {
			prescription_get_confirm.prescriptionGet(req.params.id, req.params.boolean)
				.then(result => {
					var response = responseData(result, null, errors(null, null));
					res.json(response);
				})
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}
	});

	router.post('/prescription/:id', (req, res) => {
		if (checkToken(req)) {
			prescription_post.prescriptionPost(req.body)
				.then(result => {
					res.json({ status: result.status, message: result.message });
				})
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}
	});

	router.post('/prescription/photo/:id', (req, res) => {
		if (checkToken(req)) {
			var prescription = req.body;
			prescriptionPhoto_post.prescriptionPhotoPost(prescription)
				.then(result => {
					res.json(responseData(result, null, null));
				});
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}
	});

	router.post('/images/upload/:id', (req, res) => {
		if (checkToken(req)) {
			photo.upload(req, res, function (err) {
				if (err) {
					res.json(responseData(null, true, errors(2036, err.message)));
				} else {
					console.log(req.file.filename);
					let path = `/api/images/${req.file.filename}`;
					var data = { message: 'Image Uploaded Successfully !', path: path };
					res.json(responseData(data, null, null));
				}

			});
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}

	})

	router.get('/images/:imagename', (req, res) => {
		console.log("-->run get image")
		let imagename = req.params.imagename
		let imagepath = __dirname + "/images/" + imagename
		let image = fs.readFileSync(imagepath)
		let mime = fileType(image).mime

		res.writeHead(200, { 'Content-Type': mime })
		res.end(image, 'binary')
	})

	//------------------------------1Pay (thanh toán trực tuyến)----------------------------------

	router.post('/1pay/:id', (req, res) => {
		if (checkToken(req)) {
			var data = req.body;
			console.log(data);
			pay.PayPost(data)
				.then(result => {
					// console.log("****Mã Thanh Toán Card")
					// console.log(result.status + "   " + result.amount);
					res.json({ status: result.status, message: result.amount });
				})
		} else {
			res.json(responseData(null, true, errors(2020, 'Invalid Token !')));
		}

	});

	//------------------------------confirm (kiểm duyệt đơn thuốc)----------------------------------

	router.get('/confirm', (req, res) => {
		res.render(__dirname + "/view/confirmPresciption.ejs");
	});

	router.get('/viewModal', (req, res) => {
		res.render(__dirname + "/view/viewModal.ejs");
	});

	router.get('/confirmList/:boolean', (req, res) => {
		var id = 'all';
		prescription_get_confirm.prescriptionGet(id, req.params.boolean)
			.then(result => {
				res.json(result);
			})
	});

	router.put('/confirmList/:id', (req, res) => {
		prescription_put_confirm.prescriptionPut(req.params.id, req.body)
			.then(result => {
				res.json(result);
			})
	});
}