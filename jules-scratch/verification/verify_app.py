import re
from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # 1. Navigate to the application
            page.goto("http://localhost:8000/")

            # 2. Wait for the main heading and check it
            heading = page.get_by_role("heading", name="Calculateur d'Intérêts Composés Juridiques")
            expect(heading).to_be_visible()

            # 3. Check a default value in the form
            principal_input = page.get_by_label("Principal")
            expect(principal_input).to_have_value("996670")

            # 4. Click the Calculate button
            calculate_button = page.get_by_role("button", name="Calculer")
            calculate_button.click()

            # 5. Wait for the results to appear and verify the result header
            result_heading = page.get_by_role("heading", name="DECOMPTE D'INERÊTS DE DROIT")
            expect(result_heading).to_be_visible(timeout=10000) # Increased timeout for calculation

            # 6. Verify a result card is visible
            final_amount_card_heading = page.get_by_role("heading", name="Montant Final")
            expect(final_amount_card_heading).to_be_visible()

            # 7. Check for the summary value (check that it contains the currency)
            final_amount_value = page.locator("div.bg-brand-light p.text-4xl")
            expect(final_amount_value).to_contain_text("F CFA")


            # 8. Take a screenshot
            page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)

            print("Verification script completed successfully and screenshot taken.")

        except Exception as e:
            print(f"An error occurred during verification: {e}")
            page.screenshot(path="jules-scratch/verification/error.png", full_page=True)

        finally:
            browser.close()

if __name__ == "__main__":
    run_verification()
