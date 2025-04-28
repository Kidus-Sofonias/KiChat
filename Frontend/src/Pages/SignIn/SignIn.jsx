import React, { useContext, useState } from "react";
import "./SignIn.css";
import { userProvider } from "../../Context/UserProvider";
import axios from "../../Components/axios";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";

function SignIn() {
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [user, setUser] = useContext(userProvider);
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  async function logIn(data) {
    setLoading(true);
    try {
      const response = await axios.post("/api/users/login", {
        user_name: data.username,
        password: data.password,
      });

      const { token, user_name, user_id } = response.data;

      const userObj = { user_name, user_id };
      localStorage.setItem("token", token); // Save JWT
      localStorage.setItem("user", JSON.stringify(userObj)); // Optional
      setUser(userObj);

      navigate("/chat");
    } catch (error) {
      alert("Invalid credentials or server error.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="col-md-6 col-lg-5 shadow p-5 bg-white rounded">
        {loading ? (
          <div className="text-center py-5">
            <CircularProgress />
          </div>
        ) : (
          <>
            <h4 className="mb-3 text-center">Login to KiChat</h4>
            <p className="text-center text-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="text-decoration-none">
                Create one here
              </Link>
            </p>
            <form onSubmit={handleSubmit(logIn)} noValidate>
              <div className="mb-3">
                <input
                  type="text"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  placeholder="Username"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                  })}
                  onKeyUp={() => trigger("username")}
                />
                {errors.username && (
                  <div className="invalid-feedback">
                    {errors.username.message}
                  </div>
                )}
              </div>

              <div className="mb-3 position-relative">
                <input
                  type={passwordVisible ? "password" : "text"}
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  placeholder="Password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Minimum password length is 8",
                    },
                  })}
                  onKeyUp={() => trigger("password")}
                />
                <i
                  className={`fas ${
                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                  } position-absolute top-50 end-0 me-3 translate-middle-y text-muted`}
                  style={{ cursor: "pointer" }}
                  onClick={togglePasswordVisibility}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default SignIn;
