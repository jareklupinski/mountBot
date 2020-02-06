package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/websocket"
)

var addr = flag.String("addr", "localhost:8080", "http service address")
var upgrader = websocket.Upgrader{}
var greeted = make(map[string]int)

type Payload struct {
	Name    string `json:"name"`
	Message string `json:"message"`
}

func bot(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		var payload Payload
		err = json.Unmarshal(message, &payload)
		var reply Payload
		reply.Name = "Mount Sinai Help Assistant"
		reply.Message = "Indeed it does!"
		if greeted[payload.Name] == 0 {
			if strings.Contains(payload.Message, "@") {
				reply.Message = "Welcome " + payload.Message + "! How can we help you today?"
				greeted[payload.Name]++
			} else {
				reply.Message = "Sorry, I did not understand that email address. Please make sure it is in the form of username@company.tld"
			}
		}
		replyJSON, err := json.Marshal(reply)
		err = c.WriteMessage(mt, replyJSON)
		if err != nil {
			log.Println("write:", err)
			break
		}

	}
}

func main() {
	flag.Parse()
	log.SetFlags(0)
	http.HandleFunc("/bot", bot)
	log.Fatal(http.ListenAndServe(*addr, nil))
}
