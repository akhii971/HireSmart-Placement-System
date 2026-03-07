import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "All" ? true : u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="container" style={{ marginTop: "80px" }}>
      <h4>User Management</h4>

      <input
        className="form-control my-3"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table">
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, i) => (
            <tr key={u._id}>
              <td>{i + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                <Link to={`/admin/users/${u._id}`} className="btn btn-sm btn-outline-primary">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;