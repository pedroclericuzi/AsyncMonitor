//
//  FirebaseDB.swift
//  MonitorGastos
//
//  Created by Pedro Clericuzi on 08/06/2018.
//  Copyright © 2018 Pedro Clericuzi. All rights reserved.
//

import Foundation
import Firebase
import FirebaseDatabase

class FirebaseDB {
    //var ref: DatabaseReference!
    var ref = Database.database().reference()
    init() {
        FirebaseApp.configure()
    }
    func salvarDefinicoesEnergia() {
        self.ref.child("energia/definicoes/dia").setValue(9)
        self.ref.child("energia/definicoes/mes").setValue(7)
        self.ref.child("energia/definicoes/meta").setValue(20)
    }
    
    func pegarDados() -> [String : AnyObject] {
        var postDict:[String : AnyObject] = [:]
        self.ref.child("energia").child("definicoes").observe(DataEventType.value, with: { (snapshot) in
            postDict = snapshot.value as? [String : AnyObject] ?? [:]
            print("Valor do dia \(postDict)")
        })
        return postDict
    }

}
