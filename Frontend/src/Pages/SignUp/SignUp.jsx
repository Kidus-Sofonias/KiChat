import { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import axios from "../../Components/axios";
import { userProvider } from "../../Context/UserContext";
import { usePreferences } from "../../Context/usePreferences";
import { AVATAR_OPTIONS, buildAvatarUrl } from "../../Utils/avatarOptions";
import "../Auth/Auth.css";

const SignUp = () => {
  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { avatar_seed: AVATAR_OPTIONS[0].id } });

  const navigate = useNavigate();
  const [, setUser] = useContext(userProvider);
  const { copy } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const selectedAvatar = watch("avatar_seed");
  const passwordValue = watch("password");

  const selectedAvatarMeta = useMemo(
    () => AVATAR_OPTIONS.find((option) => option.id === selectedAvatar) || AVATAR_OPTIONS[0],
    [selectedAvatar]
  );

  const selectAvatar = (avatarId) => {
    setValue("avatar_seed", avatarId, { shouldValidate: true, shouldDirty: true });
    setFormError("");
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");
    try {
      await axios.post("/api/users/register", {
        user_name: data.username.trim(),
        password: data.password,
        avatar_seed: data.avatar_seed,
      });
      const response = await axios.post("/api/users/login", {
        user_name: data.username.trim(),
        password: data.password,
      });
      const { token, user_name, user_id, avatar_seed } = response.data;
      const authenticatedUser = { user_name, user_id, avatar_seed };
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      navigate("/chat");
    } catch (error) {
      setFormError(error.response?.data?.msg || copy.auth.signup.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen auth-screen-signup">
      <div className="auth-shell auth-shell-wide">
        <section className="auth-hero animate-fade-in">
          <div className="auth-kicker">{copy.auth.signup.kicker}</div>
          <h1 className="animate-slide-up">{copy.auth.signup.title}</h1>
          <p className="animate-slide-up-delay">{copy.auth.signup.description}</p>

          <div className="auth-highlight-card animate-slide-up-delay-2">
            <img
              src={buildAvatarUrl(selectedAvatarMeta.id, selectedAvatarMeta.id, 180)}
              alt={selectedAvatarMeta.name}
              className="auth-highlight-avatar"
            />
            <div className="auth-highlight-copy">
              <span>{copy.auth.signup.currentPick}</span>
              <strong>{selectedAvatarMeta.name}</strong>
              <p>{selectedAvatarMeta.mood}</p>
            </div>
          </div>
        </section>

        <section className="auth-card animate-fade-in-delay">
          {loading ? (
            <div className="auth-loading-state">
              <CircularProgress />
              <span>{copy.auth.signup.loading}</span>
            </div>
          ) : (
            <>
              <div className="auth-card-header">
                <div>
                  <span className="auth-card-label">{copy.auth.signup.cardLabel}</span>
                  <h2>{copy.auth.signup.cardTitle}</h2>
                </div>
                <p>
                  {copy.auth.signup.existingUser}{" "}
                  <Link to="/signin" className="auth-inline-link">
                    {copy.auth.signup.existingUserLink}
                  </Link>
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <input type="hidden" {...register("avatar_seed", { required: true })} />

                <div className="auth-avatar-grid">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      type="button"
                      key={avatar.id}
                      className={`auth-avatar-option ${selectedAvatar === avatar.id ? "selected" : ""}`}
                      onClick={() => selectAvatar(avatar.id)}
                    >
                      <div className="auth-avatar-portrait">
                        <img src={buildAvatarUrl(avatar.id, avatar.id, 112)} alt={avatar.name} />
                      </div>
                      <div className="auth-avatar-copy">
                        <strong>{avatar.name}</strong>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="auth-field-group">
                  <label htmlFor="signup-username">{copy.auth.signup.username}</label>
                  <input
                    id="signup-username"
                    type="text"
                    className={errors.username ? "invalid" : ""}
                    placeholder={copy.auth.signup.usernamePlaceholder}
                    {...register("username", {
                      required: copy.auth.validation.usernameRequired,
                      minLength: { value: 3, message: copy.auth.validation.usernameLength },
                    })}
                    onKeyUp={() => trigger("username")}
                  />
                  {errors.username && <span className="auth-field-error">{errors.username.message}</span>}
                </div>

                <div className="auth-field-group">
                  <label htmlFor="signup-password">{copy.auth.signup.password}</label>
                  <input
                    id="signup-password"
                    type="password"
                    className={errors.password ? "invalid" : ""}
                    placeholder={copy.auth.signup.passwordPlaceholder}
                    {...register("password", {
                      required: copy.auth.validation.passwordRequired,
                      minLength: { value: 8, message: copy.auth.validation.passwordLength },
                    })}
                    onKeyUp={() => trigger("password")}
                  />
                  {errors.password && <span className="auth-field-error">{errors.password.message}</span>}
                </div>

                <div className="auth-field-group">
                  <label htmlFor="signup-confirm-password">{copy.auth.signup.confirmPassword}</label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    className={errors.confirmPassword ? "invalid" : ""}
                    placeholder={copy.auth.signup.confirmPasswordPlaceholder}
                    {...register("confirmPassword", {
                      required: copy.auth.validation.confirmRequired,
                      validate: (value) => value === passwordValue || copy.auth.validation.passwordsMatch,
                    })}
                    onKeyUp={() => trigger("confirmPassword")}
                  />
                  {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword.message}</span>}
                </div>

                {formError && <div className="auth-form-error">{formError}</div>}

                <button type="submit" className="auth-submit-button">
                  {copy.auth.signup.submit}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default SignUp;