const inventoryRepository = require('../repositories/inventoryRepository');

class InventoryService {
  async getBalances(queryString) {
    return inventoryRepository.getBalances(queryString);
  }

  async getTransactions(queryString) {
    return inventoryRepository.getTransactions(queryString);
  }

  async getInwardReport(queryString) {
    return inventoryRepository.getInwardReport(queryString);
  }

  async getOutwardReport(queryString) {
    return inventoryRepository.getOutwardReport(queryString);
  }

  async getDashboard() {
    return inventoryRepository.getDashboard();
  }
}

module.exports = new InventoryService();
