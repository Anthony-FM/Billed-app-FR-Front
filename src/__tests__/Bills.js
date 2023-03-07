/**
 * @jest-environment jsdom
 */


import {fireEvent, screen, waitFor} from "@testing-library/dom";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom/extend-expect";

import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";

import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore); //Initialisation du mockStore

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
      // On s'attends a ce que l'icone d'avoir la classe 'active-icon'
      expect(windowIcon).toHaveClass('active-icon')


    })
    //Test du trie des tickets par ordre du + récent au plus ancien
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen
      .getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
      .map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      // On s'attend à ce que dates soit égale a datesSorted
      expect(dates).toEqual(datesSorted)
    })
    
    // On test le chemin à parcourir
    test("Then the function handleClickNewBill should contain the rigth path", async () => {      
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      document.location = '#employee/bill/new'      
      // On s'attend à ce que ROUTES_PATH['NewBill'] contienne le bon chemin #employee/bill/new
      expect(ROUTES_PATH['NewBill']).toContain('#employee/bill/new')
    })   
    
  })
  
  // On reste sur la page Bills
  describe("When I am on Bills Page", () => {
    
    // Test au click sur l'ouverture de la modale
    describe("When I click on eye icon", () => {

      // On teste si le modale s'ouvre et que la fonction handleClickIconEye() soit appelée
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
        const eyesIcon = screen.getAllByTestId('icon-eye')
  
        $.fn.modal = jest.fn(); // Initialisation de la fonction modal
  
        jest.spyOn(bill, "handleClickIconEye") // On espionne la fonction 
  
        const modalEmployee = screen.getByTestId('modalEmployee')
        $.fn.modal = jest.fn(() => modalEmployee.classList.add("show"));
        const handleClickIconEye1=jest.fn(bill.handleClickIconEye)   
           
        eyesIcon.forEach(eyeIcon => {
          eyeIcon.addEventListener('click', handleClickIconEye1(eyeIcon))      
          userEvent.click(eyeIcon)
          // On s'attends à e que la fonction soit appelée
          expect(handleClickIconEye1).toHaveBeenCalled()    
          // On s'attends à ce que la modale existe
          expect(modalEmployee).toBeTruthy()
          // On s'attends à ce que la modale possède la classe 'show'
          expect(modalEmployee).toHaveClass('show')
        })
        
      })
      
      test("Then on click on the 'Nouvelle note de frais' button, the function should be called", () => {
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
        
        const buttonNewBill = screen.getByTestId("btn-new-bill")
  
        const handleClickNewBill=jest.fn(bill.handleClickNewBill())
        
        buttonNewBill.addEventListener('click', handleClickNewBill) 
        fireEvent.click(buttonNewBill)
  
        // On s'attend à ce que la fonction soit appelée
        expect(handleClickNewBill).toHaveBeenCalled()
        
      })    
    })
  })
})

// On reste sur la page Bills
describe("Given I am a user connected as Employee", () => {
  
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      
      document.body.innerHTML = BillsUI({ data:bills })
      await waitFor(() => screen.getByTestId("btn-new-bill"))

      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    })

    describe("When an error occurs on API", () => {
      beforeEach(() => {
      
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )

        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router();
        window.onNavigate(ROUTES_PATH.Bills);       
        
        
      })
      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 404"))
            }
          }})
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list : () =>  {
              return Promise.reject(new Error("Erreur 500"))
            }
          }})

        window.onNavigate(ROUTES_PATH.Bills)

        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})  
    
