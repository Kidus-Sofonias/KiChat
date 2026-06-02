import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserContext";
import { usePreferences } from "../../Context/usePreferences";
import { AVATAR_OPTIONS, buildAvatarUrl } from "../../Utils/avatarOptions";
import "../Auth/Auth.css";

const SignIn = () => {
  const {
    register,
    trigger,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const [, setUser] = useContext(userProvider);
  const { copy } = usePreferences();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const usernameValue = watch("username", "");

  const previewAvatar = useMemo(() => {
    const normalizedUsername = usernameValue.trim().toLowerCase();
    if (!normalizedUsername) return AVATAR_OPTIONS[0];
    const characterCodeTotal = normalizedUsername
      .split("")
      .reduce((total, character) => total + character.charCodeAt(0), 0);
    return AVATAR_OPTIONS[characterCodeTotal % AVATAR_OPTIONS.length];
  }, [usernameValue]);

  const togglePasswordVisibility = () => setPasswordVisible((s) => !s);

  const logIn = async (data) => {
    setLoading(true);
    setFormError("");
    try {
      const response = await axios.post("/api/users/login", {
        user_name: data.username.trim(),
        password: data.password,
      });
      const { token, user_name, user_id, avatar_seed } = response.data;
      const authenticatedUser = { user_name, user_id, avatar_seed: avatar_seed || "aurora-bot" };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      navigate("/chat");
    } catch (error) {
      setFormError(
        error.response?.status === 401
          ? copy.auth.signin.invalidCredentials
          : error.response?.data?.msg || copy.auth.signin.genericError
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen auth-screen-signin">
      <div className="auth-shell">
        <section className="auth-hero animate-fade-in">
          <div className="auth-kicker">{copy.auth.signin.kicker}</div>
          <h1 className="animate-slide-up">{copy.auth.signin.title}</h1>
          <p className="animate-slide-up-delay">{copy.auth.signin.description}</p>

          <div className="auth-highlight-card animate-slide-up-delay-2">
            <img
              src={buildAvatarUrl(previewAvatar.id, previewAvatar.id, 180)}
              alt={previewAvatar.name}
              className="auth-highlight-avatar"
            />
            <div className="auth-highlight-copy">
              <span>{copy.auth.signin.previewLabel}</span>
              <strong>{previewAvatar.name}</strong>
            </div>
          </div>
        </section>

        <section className="auth-card animate-fade-in-delay">
          {loading ? (
            <div className="auth-loading-state">
              <CircularProgress />
              <span>{copy.auth.signin.loading}</span>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <div>
                  <span className="auth-card-label">{copy.auth.signin.cardLabel}</span>
                  <h2>{copy.auth.signin.cardTitle}</h2>
                </div>
                <p>
                  {copy.auth.signin.newHere}{" "}
                  <Link to="/signup" className="auth-inline-link">
                    {copy.auth.signin.createAccount}
                  </Link>
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit(logIn)} noValidate>
                <div className="auth-field-group">
                  <label htmlFor="signin-username">{copy.auth.signin.username}</label>
                  <input
                    id="signin-username"
                    type="text"
                    className={errors.username ? "invalid" : ""}
                    placeholder={copy.auth.signin.usernamePlaceholder}
                    {...register("username", {
                      required: copy.auth.validation.usernameRequired,
                      minLength: { value: 3, message: copy.auth.validation.usernameLength },
                    })}
                    onKeyUp={() => trigger("username")}
                  />
                  {errors.username && <span className="auth-field-error">{errors.username.message}</span>}
                </div>

                <div className="auth-field-group">
                  <label htmlFor="signin-password">{copy.auth.signin.password}</label>
                  <div className="auth-password-shell">
                    <input
                      id="signin-password"
                      type={passwordVisible ? "text" : "password"}
                      className={errors.password ? "invalid" : ""}
                      placeholder={copy.auth.signin.passwordPlaceholder}
                      {...register("password", {
                        required: copy.auth.validation.passwordRequired,
                        minLength: { value: 8, message: copy.auth.validation.passwordLength },
                      })}
                      onKeyUp={() => trigger("password")}
                    />
                    <button type="button" className="auth-password-toggle" onClick={togglePasswordVisibility}>
                      {passwordVisible ? copy.auth.signin.hide : copy.auth.signin.show}
                    </button>
                  </div>
                  {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
                </div>

                {formError && <div className="auth-form-error">{formError}</div>}

                <button type="submit" className="auth-submit-button">
                  {copy.auth.signin.submit}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default SignIn;