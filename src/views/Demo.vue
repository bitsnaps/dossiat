<script lang="ts" setup>
import { computed, ref } from 'vue'
import BButton from '@/components/base/BButton.vue'
import BAlert from '@/components/base/BAlert.vue'
import BBadge from '@/components/base/BBadge.vue'
import BCard from '@/components/base/BCard.vue'
import BDropdown from '@/components/base/BDropdown.vue'
import BInput from '@/components/base/BInput.vue'
import BModal from '@/components/base/BModal.vue'
import BAvatar from '@/components/base/BAvatar.vue'
import BCheckbox from '@/components/base/BCheckbox.vue'
import BTable from '@/components/base/BTable.vue'

const username = ref('')
const toggleModal = ref(false)
const keepLoggedIn = ref(false)
const dropdownSelection = ref('')
const checkedOptions = ref<Record<string, boolean>>({
  notifications: true,
  darkMode: false,
  terms: false,
})
const validUsername = computed(() => username.value.length > 3)
const dataColumns = ref([
  {key: 'id', label: 'ID'},
  {key: 'first_name', label: 'First Name'},
  {key: 'last_name', label: 'Last Name'},
])
const dataRows = ref([
  {id: 1, 'first_name': 'Amine', 'last_name': 'Kara'}
])
const dataLoading = ref(false)

declare const alert: (msg: string) => void
</script>

<template>
  <div class="container">

    <div class="row">
      <div class="col-md-6">
        <h1>Buttons</h1>
        <BButton>Simple</BButton>
        <BButton variant="accent">Accent</BButton>
        <BButton variant="danger">Danger</BButton>
        <BButton variant="ghost">Ghost</BButton>
        <BButton variant="gradient">Gradient</BButton>
        <BButton variant="outline">Outline</BButton>
        <BButton variant="outline" :loading="true">Loading</BButton>
        <BButton :disabled="true">Disabled</BButton>
        <BButton size="lg">Large</BButton>
        <BButton size="md">Medium (default)</BButton>
        <BButton size="sm">Small</BButton>
        <BButton icon="bi-info-square">Custom Icon</BButton>
        <BButton href="/">Home</BButton>
        <BButton to="/demo">Demo</BButton>
        <BButton type="submit">Submit</BButton>
      </div>
      
      <div class="col-md-6">
        <h1>Alerts</h1>
        <BAlert>Alert message</BAlert>
        <BAlert variant="accent">
          <p>Alert Accent</p>
        </BAlert>
        <BAlert variant="danger">
          <p>Alert Danger</p>
        </BAlert>
        <BAlert variant="info">
          <p>Alert Info</p>
        </BAlert>
        <BAlert variant="success">
          <p>Alert Success</p>
        </BAlert>
        <BAlert variant="warning">
          <p>Alert Warning</p>
        </BAlert>
        <BAlert :dismissible="true">
          <p>Dismissible</p>
        </BAlert>
        <BAlert icon="bi-info-square">
          <p>Custom Icon</p>
        </BAlert>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6">
        <h1>Badges</h1>
        <BBadge>Badge</BBadge>
        <BBadge variant="info">Badge Info</BBadge>
        <BBadge variant="success">Badge Success</BBadge>
        <BBadge size="sm">Badge Small</BBadge>
      </div>
      <div class="col-md-6">
        <h1>Cards</h1>
        <BCard>
          <p>Card</p>
        </BCard>
        <BCard variant="elevated">
          <p>Card elevated</p>
        </BCard>
        <BCard variant="transparent">
          <p>Card transparent</p>
        </BCard>
        <BCard :clickable="true">
          <p>Clickable</p>
        </BCard>
        <BCard padding="lg">
          <p>Large padding</p>
        </BCard>
        <BCard padding="md">
          <p>Medium padding (default)</p>
        </BCard>
        <BCard padding="sm">
          <p>Small padding</p>
        </BCard>
        <BCard>
          <template #header>
            <h3>Header</h3>
          </template>
          <p>Body</p>
          <template #footer>
            <p>Footer</p>
          </template>
        </BCard>

      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-6">
        <h1>Dropdowns</h1>
        <div class="mb-3">
          <BDropdown label="Actions" @select="dropdownSelection = ($event.target as HTMLElement).textContent?.trim() ?? ''">
            <div class="ds-dropdown-item"><i class="bi bi-pencil"></i> Edit</div>
            <div class="ds-dropdown-item"><i class="bi bi-trash"></i> Delete</div>
            <div class="ds-dropdown-item"><i class="bi bi-arrow-down-up"></i> Reorder</div>
          </BDropdown>
        </div>
        <p v-if="dropdownSelection" class="mt-2 text-muted-2">Selected: {{ dropdownSelection }}</p>
        <div class="mb-3">
          <BDropdown label="Sort by" placement="end">
            <div class="ds-dropdown-item"><i class="bi bi-sort-alpha-down"></i> Name</div>
            <div class="ds-dropdown-item"><i class="bi bi-calendar"></i> Date</div>
            <div class="ds-dropdown-item"><i class="bi bi-arrow-up-down"></i> Price</div>
          </BDropdown>
        </div>
        <div class="mb-3">
          <BDropdown label="Disabled" :disabled="true">
            <div class="ds-dropdown-item">No items</div>
          </BDropdown>
        </div>
        <div class="mb-3">
          <BDropdown>
            <template #trigger>
              <BButton variant="accent" size="sm"><i class="bi bi-gear"></i> Settings</BButton>
            </template>
            <div class="ds-dropdown-item"><i class="bi bi-person"></i> Profile</div>
            <div class="ds-dropdown-item"><i class="bi bi-bell"></i> Notifications</div>
            <div class="ds-dropdown-item"><i class="bi bi-box-arrow-right"></i> Logout</div>
          </BDropdown>
        </div>
      </div>

      <div class="col-md-6">
        <h1>Inputs</h1>
        <BInput label="User name" v-model="username" 
          placeholder="Enter your name" 
          :error="validUsername?'':'User name should not be empty'"
          hint="User name must be greater than 3 characters."
          icon="bi-clock"
          :disabled="false"
          />
        <p v-show="validUsername">Welcome back {{ username }}!</p>
      </div>
    </div>

  <div class="row mt-4">

    <div class="col-md-12">
      <h1>Modal</h1>
      <BButton @click="toggleModal = !toggleModal">Show Modal</BButton>

      <BModal :modelValue="toggleModal" title="Login" size="lg" @close="toggleModal = false">
        <form action="/" method="post">
          <BInput label="Username" name="username" />
          <BInput label="Password" name="password" type="password" />
          <BCheckbox v-model="keepLoggedIn" label="Stay logged in." />
          <p class="text-muted-2">Keep Logged In: {{ keepLoggedIn }}</p>
        </form>
        <template #footer>
          <BButton variant="outline" @click="toggleModal = false">Close</BButton>
          <BButton type="submit">Send</BButton>
        </template>
      </BModal>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-md-6">
      <h1>Checkboxes</h1>
      <BCheckbox v-model="keepLoggedIn" label="Keep me logged in" />
      <BCheckbox v-model="checkedOptions.notifications" label="Enable notifications" hint="You can change this later in settings." />
      <BCheckbox v-model="checkedOptions.darkMode" label="Dark mode" hint="Toggle between light and dark themes." />
      <BCheckbox v-model="checkedOptions.terms" label="I agree to the terms and conditions" error="You must accept the terms to continue." />
      <BCheckbox label="Disabled option" :disabled="true" />
      <div class="mt-2 text-muted-2">
        <p>Notifications: {{ checkedOptions.notifications }}</p>
        <p>Dark Mode: {{ checkedOptions.darkMode }}</p>
        <p>Terms: {{ checkedOptions.terms }}</p>
      </div>
    </div>

    <div class="col-md-6">
      <h1>Avatars</h1>
      <div class="d-flex align-items-center gap-3 mb-3">
        <BAvatar name="Amine Kara" size="sm" />
        <BAvatar name="Amine Kara" />
        <BAvatar name="Amine Kara" size="lg" />
      </div>
      <div class="d-flex align-items-center gap-3 mb-3">
        <BAvatar name="John Doe" online />
        <BAvatar name="Jane Smith" online />
        <BAvatar name="Bob" />
      </div>
      <div class="d-flex align-items-center gap-3 mb-3">
        <BAvatar src="https://i.pravatar.cc/150?img=1" size="sm" />
        <BAvatar src="https://i.pravatar.cc/150?img=2" />
        <BAvatar src="https://i.pravatar.cc/150?img=3" size="lg" online />
      </div>
    </div>
  </div>

  <div class="row mt-4">

      <BTable
        :columns="dataColumns"
        :rows="dataRows"
        :loading="dataLoading"
        :selectable="false"
        :expandable="false"
        :pagination="true"
        :page-size="5"
        :page-size-options="[5,10,25]"
        :striped="true"
        :hover="true"
        :bordered="false"
        row-key="id"
        search-placeholder="Search employees..."
      >
        <!-- Custom cell: avatar + name -->
        <template #cell-name="{ row }">
          <div class="d-flex align-items-center gap-2">
            <span class="badge rounded-pill text-bg-primary">{{ row.name.charAt(0) }}</span>
            <div>
              <div class="fw-semibold">{{ row.name }}</div>
              <small class="text-muted">{{ row.email }}</small>
            </div>
          </div>
        </template>

        <!-- Custom cell: status badge -->
        <template #cell-status="{ row }">
          <span class="badge" :class="row.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary'">
            {{ row.status }}
          </span>
        </template>

        <!-- Custom cell: salary -->
        <template #cell-salary="{ value }">
          <code>${{ value.toLocaleString() }}</code>
        </template>

        <!-- Row actions -->
        <template #cell-actions="{ row }">
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" @click.stop="alert('Edit ' + row.name)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-outline-danger"  @click.stop="alert('Delete ' + row.name)"><i class="bi bi-trash"></i></button>
          </div>
        </template>

        <!-- Expanded row content -->
        <template #expanded-row="{ row }">
          <div class="p-3">
            <h6 class="mb-2">Details for {{ row.name }}</h6>
            <div class="row g-2">
              <div class="col-md-4"><strong>Department:</strong> {{ row.department }}</div>
              <div class="col-md-4"><strong>Hire date:</strong> {{ row.hireDate }}</div>
              <div class="col-md-4"><strong>Manager:</strong> {{ row.manager }}</div>
            </div>
          </div>
        </template>

        <!-- Empty state override -->
        <template #empty>
          <div class="py-5 text-center text-muted">
            <i class="bi bi-inbox" style="font-size: 2rem;"></i>
            <div class="mt-2">No employees found.</div>
          </div>
        </template>
      </BTable>

  </div>
  </div>
</template>
