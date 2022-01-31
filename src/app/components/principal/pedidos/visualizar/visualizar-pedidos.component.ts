import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Pedido } from 'src/app/model/pedido';
import { Item } from 'src/app/model/item';
import { Endereco } from 'src/app/model/endereco';
import { PedidoService } from 'src/app/service/pedido.service';

@Component({
   selector: 'app-visualizar-pedidos',
   templateUrl: './visualizar-pedidos.component.html',
   styleUrls: ['./visualizar-pedidos.component.css']
})
export class VisualizarPedidosComponent implements OnInit {

   pedidos!: Pedido[];
   pedido: Pedido;
   itens: Item[];
   enderecoEntrega: Endereco;
   formFinalizacao!: FormGroup;

   modalRef?: BsModalRef;

   constructor(
      private pedidoService: PedidoService,
      private modalService: BsModalService,
      private fb: FormBuilder
   ) {
      this.pedido = new Pedido();
      this.itens = [];
      this.enderecoEntrega = new Endereco();
   }

   ngOnInit(): void {
      this.pedidos = this.pedidoService.getPedidos();
   }

   modalItens(template: TemplateRef<Item[]>, id: number): void {
      this.itens = this.pedidoService.getPedidoById(id).itens;

      this.modalRef = this.modalService.show(template,
         Object.assign({}, { class: 'modal-lg' })
      );
   }

   modalEndereco(template: TemplateRef<Endereco>, id: number): void {
      this.enderecoEntrega = this.pedidoService.getPedidoById(id).localEntrega;

      this.modalRef = this.modalService.show(template,
         Object.assign({}, { class: 'modal-lg' })
      );
   }

   modalAcoes(template: TemplateRef<Pedido>, id: number): void {
      this.pedido = this.pedidoService.getPedidoById(id);

      this.formFinalizacao = this.fb.group({
         dataFinalizado: [Date.parse(Date.now().toString()), [Validators.required]]
      });

      this.modalRef = this.modalService.show(template,
         Object.assign({}, { class: 'modal-md' })
      );
   }

   alterarStatus(status: string): void {
      this.pedido.status = status;

      if (status === 'Finalizado') {
         if (this.formFinalizacao.valid) {
            this.pedido.dataFinalizado = this.formFinalizacao.get('dataFinalizado')?.value;
            this.pedidoService.alterarStatus(this.pedido);
            this.modalRef?.hide();
         }
      } else {
         this.pedidoService.alterarStatus(this.pedido);
         this.modalRef?.hide();
      }

      console.log(this.pedido);
   }

   arquivarPedido(): void {
      this.pedidoService.arquivar(this.pedido);
      this.modalRef?.hide();
   }

   /**
    * Atribui as cores de fundo da coluna de status do pedido de acordo com o seu estado
    * @param status andamento do pedido
    * @returns classe do Bootstrap com as cores de fundo
    */
   cssFundoStatus(status: string): string {
      let classe!: string;

      switch (status) {
         case 'Finalizado':
            classe = 'bg-success bg-opacity-25';
            break;

         case 'Cancelado':
            classe = 'bg-danger bg-opacity-25';
            break;
         case 'Atrasado':
            classe = 'bg-warning bg-opacity-25';
            break;

         case 'Em andamento':
            classe = 'bg-primary bg-opacity-25';
            break;
      }

      return classe;
   }

}
