<tr v-for="quote in quotes" :key="quote.id" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4 font-bold text-slate-700">#{{ quote.id }}</td>
              
              <td class="px-6 py-4">{{ quote.cliente_nome }}</td>
              
              <td class="px-6 py-4 text-slate-500">
                {{ new Date(quote.data_venda).toLocaleDateString() }}
              </td>
              
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase">
                  {{ quote.status }}
                </span>
              </td>
              
              <td class="px-6 py-4 text-right font-bold text-emerald-600">
                R$ {{ Number(quote.valor_total).toFixed(2) }}
              </td>
              
              <td class="px-6 py-4 text-center">
                <button class="text-blue-600 hover:underline text-xs">Ver PDF</button>
              </td>
            </tr>