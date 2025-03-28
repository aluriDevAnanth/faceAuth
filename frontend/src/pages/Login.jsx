import { useState, useRef, useContext } from 'react';
import * as Yup from 'yup';
import Webcam from 'react-webcam';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import AuthCon from '../context/AuthPro';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'

export default function Login() {
  const [view, setView] = useState(22);
  const [error, setError] = useState();
  const webcamRef = useRef(null);
  const [file, setFile] = useState()
  const { setUser, setAuth, setMatches } = useContext(AuthCon);
  const navi = useNavigate()

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    pass: Yup.string().required('Required'),
  });

  const signupValidationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    pass: Yup.string().required('Required'),
    cpass: Yup.string()
      .oneOf([Yup.ref('pass'), null], 'Passwords must match')
      .required('Required'),
  });

  const handleLoginSubmit = async (values, setSubmitting) => {
    const photo = webcamRef.current.getScreenshot();
    const blob = await fetch(photo).then(res => res.blob());

    const q = { ...values }
    const formData = new FormData();
    for (const name in q) {
      formData.append(name, q[name]);
    }
    formData.append('photo', blob, 'webcam-capture.jpg');

    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      body: formData
    });
    const res = await response.json();

    console.log(res);

    if (!res.success) { setError(res.error); setSubmitting(false); }
    else {
      const { _distance } = res.data.matches;

      if (_distance < 0.6) {
        Cookies.set('token', res.data.token)
        setAuth(res.data.token)
        setUser(res.data.user)
        localStorage.setItem('dis', _distance)
        setMatches(localStorage.getItem('dis'))
        navi('/')
      } else {
        setError('wrong face')
      }
      setSubmitting(false);
    }

  };

  const handleSignupSubmit = async (values) => {
    const q = {
      ...values, photo: file
    }
    const formData = new FormData();
    for (const name in q) {
      formData.append(name, q[name]);
    }

    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      body: formData
    })
    await response.json();

    setView(22)
  };

  return (
    <>
      {view === 22 &&
        <div className='d-flex justify-content-center'>
          <Formik
            initialValues={{ email: '', pass: '' }} validationSchema={loginValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleLoginSubmit(values, setSubmitting);
            }}
          >
            {({ isSubmitting }) => (
              <Form className='d-flex flex-column align-items-center gap-3 mt-5 mb-5'  >
                <h1>Login</h1>
                <div className='d-flex gap-3'>
                  <div className='form-floating mb-3'>
                    <Field className="form-control" id='email' type="email" name="email" placeholder="Email" />
                    <label htmlFor="email">Email</label>
                    <ErrorMessage component="p" name="email" className="text-danger error" />
                  </div>
                  <div className='form-floating mb-3'>
                    <Field className="form-control" id="pass" type="password" name="pass" placeholder="Password" />
                    <label htmlFor="pass">Password</label>
                    <ErrorMessage name="pass" component="p" className="text-danger error" />
                  </div>
                  {error && <div className="alert alert-danger" role="alert">
                    {error}
                    {error === 'Server error' && <p>  this may be due to dark pic,   <br />
                      which it server is not able to detect,  <br />
                      adjust the lighting, remove webcam protection cover </p>}
                  </div>}
                </div>
                <div className='mb-3'>
                  <label>Take Photo</label>
                  <div>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                    />
                  </div>
                </div>
                <div className='d-flex gap-5'>
                  <button type="submit" className='btn btn-primary' disabled={isSubmitting}>
                    {isSubmitting ? 'Authenticating...' : 'Submit'}
                  </button>
                  <button type="submit" className='btn btn-secondary' onClick={() => { setView(11) }} > Create a Account </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      }
      {view === 11 &&
        <div className='d-flex justify-content-center'>
          <Formik
            initialValues={{ email: '', pass: '', cpass: '', photo: '' }} validationSchema={signupValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              handleSignupSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className='d-flex flex-column align-items-center gap-3 mt-5'>
                <h1>Sign Up</h1>
                <div className='d-flex gap-3'>
                  <div className='form-floating mb-3'>
                    <Field className="form-control" id='email' type="email" name="email" placeholder="Email" />
                    <label htmlFor="email">Email</label>
                    <ErrorMessage name="email" component="p" className="text-danger error" />
                  </div>
                  <div className='form-floating mb-3'>
                    <Field className="form-control" id="pass" type="password" name="pass" placeholder="Password" />
                    <label htmlFor="pass">Password</label>
                    <ErrorMessage name="pass" component="p" className="text-danger error" />
                  </div>
                  <div className='form-floating mb-3'>
                    <Field className="form-control" id="cpass" type="password" name="cpass" placeholder="Confirm Password" />
                    <label htmlFor="cpass">Confirm Password</label>
                    <ErrorMessage name="cpass" component="p" className="text-danger error" />
                  </div>
                </div>
                <div className='input-group mb-3'>
                  <label className='input-group-text' htmlFor="photo">Upload Photo</label>
                  <Field
                    type="file" onChange={(e) => { setFile(e.target.files[0]); }}
                    className="form-control me-3"
                    id="photo"
                    name="photo"
                    accept=".png, .jpg, .jpeg"
                  />
                  <ErrorMessage name="photo" component="p" className="text-danger error" />
                </div>
                <div className='d-flex gap-5'>
                  <button type="submit" className='btn btn-primary' disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button type="button" onClick={() => { setView(22) }} className='btn btn-secondary'>
                    Already Have An Account
                  </button>
                </div>
              </Form>
            )}
          </Formik>

        </div>
      }
    </>
  );
}
