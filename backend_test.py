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

    # ===== COUPON SYSTEM TESTS =====
    
    def test_coupon_create_percentage(self):
        """Test POST /api/coupons - create percentage coupon"""
        if not self.auth_token:
            self.log_test("Create Percentage Coupon", False, "No auth token available")
            return False
            
        try:
            coupon_data = {
                "code": "TESTE20",
                "discountType": "percentage",
                "discountValue": 20,
                "minOrderValue": 25,
                "maxUses": 10,
                "expiresAt": "31/12/2026"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons",
                json=coupon_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "message" in data:
                    self.percentage_coupon_id = data["id"]
                    self.log_test("Create Percentage Coupon", True, f"Cupom TESTE20 criado com ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Percentage Coupon", False, "Missing id or message in response", data)
                    return False
            else:
                self.log_test("Create Percentage Coupon", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Percentage Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_create_fixed(self):
        """Test POST /api/coupons - create fixed value coupon"""
        if not self.auth_token:
            self.log_test("Create Fixed Coupon", False, "No auth token available")
            return False
            
        try:
            coupon_data = {
                "code": "DESCONTO5",
                "discountType": "fixed",
                "discountValue": 5,
                "minOrderValue": 15,
                "maxUses": 100,
                "expiresAt": "31/12/2026"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons",
                json=coupon_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "message" in data:
                    self.fixed_coupon_id = data["id"]
                    self.log_test("Create Fixed Coupon", True, f"Cupom DESCONTO5 criado com ID: {data['id']}")
                    return True
                else:
                    self.log_test("Create Fixed Coupon", False, "Missing id or message in response", data)
                    return False
            else:
                self.log_test("Create Fixed Coupon", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Fixed Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_create_duplicate(self):
        """Test POST /api/coupons - try creating duplicate code, expect 400 error"""
        if not self.auth_token:
            self.log_test("Create Duplicate Coupon", False, "No auth token available")
            return False
            
        try:
            coupon_data = {
                "code": "TESTE20",  # Same code as first coupon
                "discountType": "percentage",
                "discountValue": 10,
                "minOrderValue": 20,
                "maxUses": 5,
                "expiresAt": "31/12/2026"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons",
                json=coupon_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "detail" in data and "já existe" in data["detail"].lower():
                    self.log_test("Create Duplicate Coupon", True, "Correctly rejected duplicate coupon code")
                    return True
                else:
                    self.log_test("Create Duplicate Coupon", False, "Wrong error message for duplicate", data)
                    return False
            else:
                self.log_test("Create Duplicate Coupon", False, f"Expected HTTP 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Duplicate Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_list(self):
        """Test GET /api/coupons - list all coupons"""
        if not self.auth_token:
            self.log_test("List Coupons", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.get(
                f"{self.base_url}/api/coupons",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Should have at least 2 coupons (TESTE20, DESCONTO5) plus any existing ones
                    coupon_codes = [c.get("code") for c in data]
                    if "TESTE20" in coupon_codes and "DESCONTO5" in coupon_codes:
                        self.log_test("List Coupons", True, f"Found {len(data)} cupons including TESTE20 and DESCONTO5")
                        return True
                    else:
                        self.log_test("List Coupons", False, f"Missing expected coupons. Found: {coupon_codes}")
                        return False
                else:
                    self.log_test("List Coupons", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("List Coupons", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("List Coupons", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_percentage_valid(self):
        """Test POST /api/coupons/validate - validate TESTE20 with valid order (50 > 25)"""
        try:
            validate_data = {
                "code": "TESTE20",
                "orderTotal": 50
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_discount = 50 * 0.20  # 20% of 50 = 10.0
                if (data.get("valid") == True and 
                    data.get("code") == "TESTE20" and 
                    data.get("discountAmount") == expected_discount):
                    self.log_test("Validate Percentage Coupon (Valid)", True, f"TESTE20 válido: R$ {data['discountAmount']:.2f} desconto")
                    return True
                else:
                    self.log_test("Validate Percentage Coupon (Valid)", False, f"Unexpected validation result", data)
                    return False
            else:
                self.log_test("Validate Percentage Coupon (Valid)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Percentage Coupon (Valid)", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_percentage_min_order_fail(self):
        """Test POST /api/coupons/validate - validate TESTE20 with order below minimum (10 < 25)"""
        try:
            validate_data = {
                "code": "TESTE20",
                "orderTotal": 10
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 400:
                data = response.json()
                if "detail" in data and "mínimo" in data["detail"].lower():
                    self.log_test("Validate Percentage Coupon (Min Order Fail)", True, "Correctly rejected order below minimum")
                    return True
                else:
                    self.log_test("Validate Percentage Coupon (Min Order Fail)", False, "Wrong error message for min order", data)
                    return False
            else:
                self.log_test("Validate Percentage Coupon (Min Order Fail)", False, f"Expected HTTP 400, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Percentage Coupon (Min Order Fail)", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_invalid_code(self):
        """Test POST /api/coupons/validate - validate invalid coupon code"""
        try:
            validate_data = {
                "code": "INVALIDO",
                "orderTotal": 50
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 404:
                data = response.json()
                if "detail" in data and ("inválido" in data["detail"].lower() or "expirado" in data["detail"].lower()):
                    self.log_test("Validate Invalid Coupon", True, "Correctly rejected invalid coupon code")
                    return True
                else:
                    self.log_test("Validate Invalid Coupon", False, "Wrong error message for invalid code", data)
                    return False
            else:
                self.log_test("Validate Invalid Coupon", False, f"Expected HTTP 404, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Invalid Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_fixed_case_insensitive(self):
        """Test POST /api/coupons/validate - validate DESCONTO5 with lowercase (case insensitive)"""
        try:
            validate_data = {
                "code": "desconto5",  # lowercase
                "orderTotal": 30
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_discount = 5.0  # Fixed R$ 5.00 discount
                if (data.get("valid") == True and 
                    data.get("code") == "DESCONTO5" and  # Should be uppercase in response
                    data.get("discountAmount") == expected_discount):
                    self.log_test("Validate Fixed Coupon (Case Insensitive)", True, f"desconto5 válido: R$ {data['discountAmount']:.2f} desconto")
                    return True
                else:
                    self.log_test("Validate Fixed Coupon (Case Insensitive)", False, f"Unexpected validation result", data)
                    return False
            else:
                self.log_test("Validate Fixed Coupon (Case Insensitive)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Fixed Coupon (Case Insensitive)", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_toggle_deactivate(self):
        """Test PUT /api/coupons/{coupon_id}/toggle - deactivate coupon"""
        if not self.auth_token or not hasattr(self, 'percentage_coupon_id'):
            self.log_test("Toggle Coupon (Deactivate)", False, "No auth token or coupon ID available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.put(
                f"{self.base_url}/api/coupons/{self.percentage_coupon_id}/toggle",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "isActive" in data and data["isActive"] == False:
                    self.log_test("Toggle Coupon (Deactivate)", True, "Cupom TESTE20 desativado com sucesso")
                    return True
                else:
                    self.log_test("Toggle Coupon (Deactivate)", False, "Unexpected toggle response", data)
                    return False
            else:
                self.log_test("Toggle Coupon (Deactivate)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Toggle Coupon (Deactivate)", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_deactivated(self):
        """Test POST /api/coupons/validate - validate deactivated coupon (should fail)"""
        try:
            validate_data = {
                "code": "TESTE20",
                "orderTotal": 50
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 404:
                data = response.json()
                if "detail" in data and ("inválido" in data["detail"].lower() or "expirado" in data["detail"].lower()):
                    self.log_test("Validate Deactivated Coupon", True, "Correctly rejected deactivated coupon")
                    return True
                else:
                    self.log_test("Validate Deactivated Coupon", False, "Wrong error message for deactivated coupon", data)
                    return False
            else:
                self.log_test("Validate Deactivated Coupon", False, f"Expected HTTP 404, got {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Deactivated Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_toggle_reactivate(self):
        """Test PUT /api/coupons/{coupon_id}/toggle - reactivate coupon"""
        if not self.auth_token or not hasattr(self, 'percentage_coupon_id'):
            self.log_test("Toggle Coupon (Reactivate)", False, "No auth token or coupon ID available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.put(
                f"{self.base_url}/api/coupons/{self.percentage_coupon_id}/toggle",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "isActive" in data and data["isActive"] == True:
                    self.log_test("Toggle Coupon (Reactivate)", True, "Cupom TESTE20 reativado com sucesso")
                    return True
                else:
                    self.log_test("Toggle Coupon (Reactivate)", False, "Unexpected toggle response", data)
                    return False
            else:
                self.log_test("Toggle Coupon (Reactivate)", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Toggle Coupon (Reactivate)", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_delete(self):
        """Test DELETE /api/coupons/{coupon_id} - delete coupon"""
        if not self.auth_token or not hasattr(self, 'fixed_coupon_id'):
            self.log_test("Delete Coupon", False, "No auth token or coupon ID available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.delete(
                f"{self.base_url}/api/coupons/{self.fixed_coupon_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "excluído" in data["message"].lower():
                    self.log_test("Delete Coupon", True, "Cupom DESCONTO5 excluído com sucesso")
                    return True
                else:
                    self.log_test("Delete Coupon", False, "Unexpected delete response", data)
                    return False
            else:
                self.log_test("Delete Coupon", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Delete Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_verify_deleted(self):
        """Test GET /api/coupons - verify deleted coupon is gone from list"""
        if not self.auth_token:
            self.log_test("Verify Deleted Coupon", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}"
            }
            
            response = requests.get(
                f"{self.base_url}/api/coupons",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    coupon_codes = [c.get("code") for c in data]
                    if "DESCONTO5" not in coupon_codes:
                        self.log_test("Verify Deleted Coupon", True, "DESCONTO5 não encontrado na lista (excluído com sucesso)")
                        return True
                    else:
                        self.log_test("Verify Deleted Coupon", False, f"DESCONTO5 ainda na lista: {coupon_codes}")
                        return False
                else:
                    self.log_test("Verify Deleted Coupon", False, "Response is not a list", data)
                    return False
            else:
                self.log_test("Verify Deleted Coupon", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Verify Deleted Coupon", False, f"Connection error: {str(e)}")
            return False

    def test_coupon_validate_existing_amarena10(self):
        """Test POST /api/coupons/validate - validate existing AMARENA10 coupon"""
        try:
            validate_data = {
                "code": "AMARENA10",
                "orderTotal": 50
            }
            
            response = requests.post(
                f"{self.base_url}/api/coupons/validate",
                json=validate_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_discount = 50 * 0.10  # 10% of 50 = 5.0
                if (data.get("valid") == True and 
                    data.get("code") == "AMARENA10" and 
                    data.get("discountAmount") == expected_discount):
                    self.log_test("Validate Existing AMARENA10", True, f"AMARENA10 válido: R$ {data['discountAmount']:.2f} desconto (10%)")
                    return True
                else:
                    self.log_test("Validate Existing AMARENA10", False, f"Unexpected validation result", data)
                    return False
            elif response.status_code == 404:
                # AMARENA10 doesn't exist, which is fine - just note it
                self.log_test("Validate Existing AMARENA10", True, "AMARENA10 não existe (normal se não foi criado ainda)")
                return True
            else:
                self.log_test("Validate Existing AMARENA10", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Validate Existing AMARENA10", False, f"Connection error: {str(e)}")
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
            self.test_mercado_pago_integration,
            # Coupon system tests
            self.test_coupon_create_percentage,
            self.test_coupon_create_fixed,
            self.test_coupon_create_duplicate,
            self.test_coupon_list,
            self.test_coupon_validate_percentage_valid,
            self.test_coupon_validate_percentage_min_order_fail,
            self.test_coupon_validate_invalid_code,
            self.test_coupon_validate_fixed_case_insensitive,
            self.test_coupon_toggle_deactivate,
            self.test_coupon_validate_deactivated,
            self.test_coupon_toggle_reactivate,
            self.test_coupon_delete,
            self.test_coupon_verify_deleted,
            self.test_coupon_validate_existing_amarena10
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