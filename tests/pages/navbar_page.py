from selenium.webdriver.common.by import By
from tests.pages.base_page import BasePage


class NavbarPage(BasePage):
    def toggle_mobile_menu(self):
        self.click(By.XPATH, "//button[contains(@aria-controls, 'mobile-menu')]")
        return self

    def is_mobile_menu_open(self):
        mobile_menu = self.driver.find_element(By.ID, 'mobile-menu')
        return mobile_menu.is_displayed()

    def get_mobile_links(self):
        return [element.text for element in self.find_all(By.XPATH, "//div[@id='mobile-menu']//a")]
