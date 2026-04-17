#!/usr/bin/env python3
"""
Amarena Sorvetes Backend API Test Suite
Tests all backend endpoints for the ice cream shop management system
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://gelado-delivery.preview.emergentagent.com"

# Test credentials from backend .env
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, details="", response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()
        
    def test_health_check(self):
        """Test GET /api/health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "ok" and data.get("database") == "connected":
                    self.log_test("Health Check", True, "API and database are healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected response format", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test POST /api/admin/login endpoint"""
        try:
            login_data = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            
            response = requests.post(
                f"{self.base_url}/api/admin/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "username" in data:
                    self.auth_token = data["token"]
                    self.log_test("Admin Login", True, f"Successfully logged in as {data['username']}")
                    return True
                else:
                    self.log_test("Admin Login", False, "Missing token or username in response", data)
                    return False
            else:
                self.log_test("Admin Login", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_products_empty(self):
        """Test GET /api/products when no products exist"""
        try:
            response = requests.get(f"{self.base_url}/api/products", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Products (Empty)", True, f"Returned {len(data)} products")
                    return True
                else:
                    self.log_test("Get Products (Empty)", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Get Products (Empty)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Products (Empty)", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_products_with_category(self):
        """Test GET /api/products?category=sorvetes"""
        try:
            response = requests.get(f"{self.base_url}/api/products?category=sorvetes", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Products (Category Filter)", True, f"Returned {len(data)} sorvetes")
                    return True
                else:
                    self.log_test("Get Products (Category Filter)", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Get Products (Category Filter)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Products (Category Filter)", False, f"Connection error: {str(e)}")
            return False
    
    def test_create_product(self):
        """Test POST /api/products with authentication"""
        if not self.auth_token:
            self.log_test("Create Product", False, "No auth token available")
            return False
            
        try:
            product_data = {
                "name": "Sorvete de Morango",
                "category": "sorvetes",
                "price": 15.90,
                "image": "data:image/png;base64,test",
                "description": "Delicioso sorvete de morango",
                "subcategory": "frutas",
                "isLaunch": True,
                "stock": 100,
                "isActive": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/api/products",
                json=product_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "message" in data:
                    self.product_id = data["id"]
                    self.log_test("Create Product", True, f"Product created with ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Product", False, "Missing id or message in response", data)
                    return False
            else:
                self.log_test("Create Product", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Product", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_products_after_creation(self):
        """Test GET /api/products after creating a product"""
        try:
            response = requests.get(f"{self.base_url}/api/products", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    product = data[0]
                    if product.get("name") == "Sorvete de Morango":
                        self.log_test("Get Products (After Creation)", True, f"Found created product: {product['name']}")
                        return True
                    else:
                        self.log_test("Get Products (After Creation)", False, "Created product not found in list", data)
                        return False
                else:
                    self.log_test("Get Products (After Creation)", False, "No products found after creation", data)
                    return False
            else:
                self.log_test("Get Products (After Creation)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Products (After Creation)", False, f"Connection error: {str(e)}")
            return False
    
    def test_admin_stats(self):
        """Test GET /api/admin/stats with authentication"""
        if not self.auth_token:
            self.log_test("Admin Stats", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.get(
                f"{self.base_url}/api/admin/stats",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["totalProducts", "totalOrders", "pendingOrders", "totalRevenue"]
                if all(field in data for field in required_fields):
                    self.log_test("Admin Stats", True, f"Stats: {data}")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Admin Stats", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_test("Admin Stats", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Stats", False, f"Connection error: {str(e)}")
            return False
    
    def test_mercado_pago_integration(self):
        """Test POST /api/payment/create for Mercado Pago integration"""
        try:
            # Parameters should be sent as query parameters, not JSON body
            params = {
                "order_id": "test123",
                "total": 50.00
            }
            
            response = requests.post(
                f"{self.base_url}/api/payment/create",
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["preferenceId", "initPoint", "publicKey"]
                if all(field in data for field in required_fields):
                    self.log_test("Mercado Pago Integration", True, "Payment preference created successfully")
                    return True
                else:
                    missing = [f for f in required_fields if f not in data]
                    self.log_test("Mercado Pago Integration", False, f"Missing fields: {missing}", data)
                    return False
            else:
                self.log_test("Mercado Pago Integration", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Mercado Pago Integration", False, f"Connection error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 60)
        print("AMARENA SORVETES BACKEND API TEST SUITE")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print(f"Test started at: {datetime.now().isoformat()}")
        print()
        
        # Test sequence as requested
        tests = [
            self.test_health_check,
            self.test_admin_login,
            self.test_get_products_empty,
            self.test_get_products_with_category,
            self.test_create_product,
            self.test_get_products_after_creation,
            self.test_admin_stats,
            self.test_mercado_pago_integration
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        print()
        
        # Print detailed results
        print("DETAILED RESULTS:")
        print("-" * 40)
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)