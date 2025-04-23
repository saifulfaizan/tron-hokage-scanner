module.exports = {
  payloads: ["' OR '1'='1", "<script>alert(1)</script>", "../../etc/passwd"],
  headers: {
    "X-Forwarded-For": "127.0.0.1",
    "X-Originating-IP": "127.0.0.1"
  }
}
