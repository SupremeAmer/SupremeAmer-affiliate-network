import React, { useEffect } from "react";
import { Button, Box, Typography, CircularProgress, Paper } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import { motion, AnimatePresence } from "framer-motion";

const FB_APP_ID = "3535690456739980"; // <-- Replace with your FB App ID

const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60 } },
  exit: { opacity: 0, y: -60, transition: { duration: 0.3 } }
};

export default function FacebookLogin() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  useEffect(() => {
    // Load Facebook SDK
    if (!window.FB) {
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: FB_APP_ID,
          cookie: true,
          xfbml: true,
          version: "v19.0"
        });
      };
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleFBLogin = () => {
    setLoading(true);
    setError("");
    window.FB.login(
      function (response) {
        if (response.authResponse) {
          window.FB.api(
            "/me",
            { fields: "id,name,email,picture" },
            function (userData) {
              setLoading(false);
              // You can send userData and response.authResponse.accessToken to your backend here
              // For demo, just redirect:
              window.location.href = "home.html";
            }
          );
        } else {
          setLoading(false);
          setError("Facebook login was cancelled.");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)"
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          textAlign: "center",
          background: "#fff",
          minWidth: 340,
          boxShadow: "0 6px 30px 0 rgba(33,203,243,0.15)"
        }}
        component={motion.div}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <motion.div
          initial={{ y: -32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 60 }}
        >
          <FacebookIcon sx={{ color: "#1877f3", fontSize: 54, mb: 1 }} />
          <Typography variant="h4" fontWeight={700} mb={1.5}>
            Sign in with Facebook
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" mb={3}>
            Secure one-click login. No password required.
          </Typography>
        </motion.div>
        <AnimatePresence>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              style={{ margin: "16px 0" }}
            >
              <CircularProgress color="primary" />
              <Typography variant="caption" display="block" mt={2}>
                Connecting to Facebook...
              </Typography>
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
            >
              <Button
                variant="contained"
                startIcon={<FacebookIcon />}
                onClick={handleFBLogin}
                sx={{
                  background:
                    "linear-gradient(90deg, #1877f3 0%, #21cbf3 100%)",
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: 18,
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #125ccc 0%, #1696b6 100%)"
                  },
                  boxShadow: "0 4px 20px 0 rgba(33,150,243,0.18)"
                }}
                size="large"
              >
                Continue with Facebook
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {error && (
          <Typography
            color="error"
            mt={3}
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
