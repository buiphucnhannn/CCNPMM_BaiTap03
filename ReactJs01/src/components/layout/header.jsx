import React, { useContext, useState } from "react";
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState("home");

    const onClick = (e) => {
        if (e.key === "logout") {
            localStorage.removeItem("access_token");
            setAuth({
                isAuthenticated: false,
                user: {
                    email: "",
                    name: ""
                }
            });
            setCurrent("home");
            navigate("/");
            return;
        }

        setCurrent(e.key);
    };

    const items = [
        {
            label: <Link to={"/"}>Home Page</Link>,
            key: "home",
            icon: <HomeOutlined />
        },
        ...(auth.isAuthenticated
            ? [
                  {
                      label: <Link to={"/user"}>Users</Link>,
                      key: "user",
                      icon: <UsergroupAddOutlined />
                  }
              ]
            : []),
        {
            label: `Welcome ${auth?.user?.email ?? ""}`,
            key: "submenu",
            icon: <SettingOutlined />,
            children: auth.isAuthenticated
                ? [{ label: "Đăng xuất", key: "logout" }]
                : [{ label: <Link to={"/login"}>Đăng nhập</Link>, key: "login" }]
        }
    ];

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;
