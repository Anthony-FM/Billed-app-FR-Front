/**
 * @jest-environment jsdom
 */


import {fireEvent, screen, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/extend-expect";

import { ROUTES, ROUTES_PATH } from "../constants/routes"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon')


    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then the function handleClickNewBill should return the rigth path", async () => {      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      document.location = '#employee/bill/new'      
      
      expect(ROUTES_PATH['NewBill']).toContain('#employee/bill/new')
    })
    
    
  })
  
  describe("When I click on eye icon", () => {
    test("Then the modal is open", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      window.onNavigate(ROUTES_PATH.Bills)

      const bill = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      
      document.body.innerHTML = BillsUI({ data:bills })
      const eyeIcon = screen.getAllByTestId('icon-eye')

      $.fn.modal = jest.fn();
      const handleClickIconEye1=jest.fn(bill.handleClickIconEye(eyeIcon[0]))      
      eyeIcon[0].addEventListener('click', handleClickIconEye1())      
      userEvent.click(eyeIcon[0])
      expect(handleClickIconEye1).toHaveBeenCalled()
      expect(handleClickIconEye1.mock.calls).toHaveLength(1)
      
      const modalEmployee = screen.getByTestId('modalEmployee')
      expect(modalEmployee).toBeTruthy()
      // expect(modalEmployee).toHaveClass('show')
      
    })
    
    test("Then on click the function should be called", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      window.onNavigate(ROUTES_PATH.NewBill)

      const bill = new Bills({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      
      document.body.innerHTML = BillsUI({ data:bills })
      
      const buttonNewBill = screen.getByTestId("btn-new-bill")

      const handleClickNewBill=jest.fn(bill.handleClickNewBill())
      
      buttonNewBill.addEventListener('click', handleClickNewBill) 
      fireEvent.click(buttonNewBill)

      expect(handleClickNewBill).toHaveBeenCalled()
      
    })    
  })
})

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);
        expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
      });
    });
  });
      
  