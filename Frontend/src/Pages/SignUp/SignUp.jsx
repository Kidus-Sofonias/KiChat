import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserProvider";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";

const SignUp = () => {
  const {
    register,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [user, setUser] = useContext(userProvider);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/users/register", {
        user_name: data.username,
        password: data.password,
      });

      alert("Registration successful. Please log in.");
      navigate("/signin");
    } catch (err) {
      alert("Signup failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            <h4 className="mb-3 text-center">Create Your KiChat Account</h4>
            <p className="text-center text-muted">
              Already have an account?{" "}
              <Link to="/signin" className="text-decoration-none">
                Log in here
              </Link>
            </p>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <input
                  type="text"
                  className={`form-control ${
                    errors.username ? "is-invalid" : ""
                  }`}
                  placeholder="Username"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  onKeyUp={() => trigger("username")}
                />
                {errors.username && (
                  <div className="invalid-feedback">
                    {errors.username.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <input
                  type="password"
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
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Create Account
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUp;
