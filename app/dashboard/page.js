"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

import Rolling from '../../components/rolling';

export default function dashboard() {
  const [pseudo, setPseudo] = useState("");
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/checkToken", {
          method: "GET",
          credentials: "include", // required for cookies
        });

        const data = await response.json();

        if (response.ok) {
          setPseudo(data.pseudo);
          setActive(data.isActive);
          // Récupérer l'avatar
          const res = await fetch("/api/getAvatarUrl", {
            method: "GET"
          });
          const json = await res.json();
          if (json.url) {
            const img = new Image();
            img.src = json.url;
            img.onload = () => {
              setAvatarUrl(json.url);
              setIsAvatarLoaded(true);
            };
            img.onerror = () => {
              console.log("erreur");
              setAvatarUrl("/images/avatar.svg");
              setIsAvatarLoaded(true);
            };
          } else {
            setIsAvatarLoaded(true);
          }
        } else {
          console.error("Error while checking token.");
          if (data.invalidToken) {
            router.push("/login?msgError=Session+expired");
          } else {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Error while checking token:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (response.ok) {
        router.replace("/login");
      }
    } catch (error) {
      console.error("Error while disconnecting :", error);
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch("/api/deleteAccount", { method: "DELETE" });
      if (response.ok) {
        toast.info("Account deleted.");
        setTimeout(async () => {
          router.replace("/login");
        }, 6000);
      }
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  if (!pseudo) {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <p style={{ fontSize: "30px", marginBottom: "5px" }}>Loading...</p>
          <div>{Rolling(50, 50, "#000000")}</div>
        </div>
      </div>
    );
  } else {
    const renderAvatar =
      isAvatarLoaded && avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          title={pseudo}
          style={{
            maxWidth: "50px",
            maxHeight: "50px",
            width: "auto",
            height: "auto",
          }}
        />
      ) : (
        <div style={{ margin: "5px" }}>{Rolling(40, 40, "#000000")}</div>
      );

    const commonContent = (
      <div style={{ paddingTop: "15px" }}>{renderAvatar}</div>
    );

    const logoutButton = (
      <button className="popButton" onClick={handleLogout}>
        Logout
      </button>
    );

    const deleteButton = (
      <button className="popButtonDelete" onClick={deleteAccount}>
        Delete Account
      </button>
    );

    return (
      <div>
        <main>
          <h1>{active ? "Welcome to the dashboard" : "Account not activated"}</h1>
          {active ? (
            <div>
              {commonContent}
              <p>
                You are connected as <b>{pseudo}</b>
              </p>
              <p>Your account is activated 🎉</p>
              <div>
                {logoutButton}
                {deleteButton}
              </div>
            </div>
          ) : (
            <div>
              {commonContent}
              <p>Your account isn't activated yet.</p>
              <p>If you want to receive a new activation link, recreate your account with the same email.</p>
              <p>The activation link is valid for 1 hour.</p>
              <p>Check your inbox (and your spam folder) for the link.</p>
              <div>
                {logoutButton}
                {deleteButton}
              </div>
            </div>
          )}
        </main>
        <ToastContainer />
      </div>
    );
  }
}
