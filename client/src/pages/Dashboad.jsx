var React = require("react");
var axios = require("axios");
var BASE_URL = require("../config");
var Redirect = require("react-router-dom").Redirect;

var Dashboard = React.createClass({
  getInitialState: function () {
    return {
      token: localStorage.getItem("skillupToken"),
      user: null,
      redirect: false
    };
  },

  componentDidMount: function () {
    if (!this.state.token) {
      this.setState({ redirect: true });
      return;
    }

    axios.get(BASE_URL + "/api/protected", {
      headers: { Authorization: "Bearer " + this.state.token }
    })
    .then((response) => {
      this.setState({ user: response.data.user });
    })
    .catch((err) => {
      console.error("Auth failed:", err.response?.data?.msg || err.message);
      this.setState({ redirect: true });
    });
  },

  render: function () {
    if (this.state.redirect) {
      return React.createElement(Redirect, { to: "/login" });
    }

    if (!this.state.user) {
      return React.createElement("p", null, "Loading dashboard...");
    }

    return React.createElement("div", null,
      React.createElement("h2", null, "Welcome to Your Dashboard"),
      React.createElement("p", null, "Username: " + this.state.user.name),
      React.createElement("p", null, "Email: " + this.state.user.email),
      React.createElement("p", null, "Role: " + this.state.user.role)
    );
  }
});

module.exports = Dashboard;

