class apply {
  constructor(name, proprietor, remarks) {
    this.name = name;
    this.proprietor = proprietor;
    this.remarks = remarks;
    this.approved = false;
  }
  isApproved() {
    this.approved = true;
  }
  checkApproval() {
    return this.approved;
  }
}

module.exports = apply;
